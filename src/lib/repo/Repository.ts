import { memoize } from "lodash";
import { Logger } from "../logger";

export type Maybe<T> = T | undefined;

export type RepositoryOptions<T, DefaultValue extends Maybe<T> = undefined> = {
  logger: Logger;
  defaultValue?: DefaultValue;
};

export abstract class Repository<T, DefaultValue extends Maybe<T> = T>
  implements PromiseLike<T | DefaultValue>
{
  public readonly defaultValue: DefaultValue;

  private _isInitialized = false;
  private _isDisposed = false;

  get isInitialized() {
    return this._isInitialized;
  }

  get isDisposed() {
    return this._isDisposed;
  }

  // Lazy resolve of logger because it needs to read
  // this.toString() which may not be available until after the constructor
  private readonly _inputLogger: Logger;
  private _logger?: Logger;
  get logger(): Logger {
    if (!this._logger) {
      const chain = describeRepository(this);
      this._logger = chain ? this._inputLogger.chain(chain) : this._inputLogger;
    }
    return this._logger;
  }

  protected constructor({
    logger,
    defaultValue,
  }: RepositoryOptions<T, DefaultValue>) {
    this._inputLogger = logger;
    this.defaultValue = defaultValue as DefaultValue;

    // read/write is commonly used in higher order functions
    this.read = this.read.bind(this);
  }

  protected abstract readImpl(): Promise<T | DefaultValue>;

  private pendingReadPromise?: Promise<T | DefaultValue>;
  async read(): Promise<T | DefaultValue> {
    if (!this.pendingReadPromise) {
      this.pendingReadPromise = this.logger
        .track(this.readImpl(), "read")
        .then((value) => {
          delete this.pendingReadPromise;
          return value ?? this.defaultValue;
        })
        .catch((e) => {
          delete this.pendingReadPromise;
          this.logger.error("Failed to read:", e);
          return this.defaultValue;
        });
    }
    return this.pendingReadPromise;
  }

  then<Resolution = T | DefaultValue, Rejection = never>(
    resolve?: (value: T | DefaultValue) => PromiseLike<Resolution> | Resolution,
    reject?: (rejection: Rejection) => PromiseLike<Rejection> | Rejection
  ) {
    return this.read().then(resolve, reject);
  }

  map<Mapped>(
    name: string,
    map: (value: T | DefaultValue) => Mapped
  ): MappedRepository<T | DefaultValue, Mapped> {
    return new MappedRepository<T | DefaultValue, Mapped>({
      logger: this.logger,
      source: this as Repository<T | DefaultValue>,
      map: (val) => map(val ?? this.defaultValue),
      name,
    });
  }

  and<Members extends RepositorySetMembers>(
    ...add: Members
  ): RepositorySet<[this, ...Members]> {
    return new RepositorySet(this, ...add);
  }

  /**
   * Starts any behavior that will be active until disposed
   */
  initialize() {
    if (this.isInitialized) {
      throw new Error("Repository already initialized");
    }
    this._isInitialized = true;
  }

  /**
   * Disposes any resources and/or behaviors that were started by initialize
   */
  dispose() {
    if (!this.isInitialized) {
      throw new Error("Repository not initialized, cannot dispose.");
    }
    if (this.isDisposed) {
      throw new Error("Repository already disposed");
    }
    this._isDisposed = true;
  }
}

function describeRepository(repo: object) {
  const str = repo.toString();
  return str !== "[object Object]" ? str : undefined;
}

export interface MappedRepositoryOptions<Source, Mapped>
  extends RepositoryOptions<Mapped> {
  source: Repository<Source, any>;
  map: (source?: Source) => Mapped;
  name?: string;
}

export class MappedRepository<Source, Mapped> extends Repository<Mapped> {
  private readonly memoizedMap = memoize((...args) => {
    this.options.logger.log("Recomputing");
    return this.options.map(...args);
  });

  constructor(private options: MappedRepositoryOptions<Source, Mapped>) {
    super({ defaultValue: options.map(), ...options });
  }

  protected readImpl(): Promise<Mapped> {
    return this.options.source.then(this.memoizedMap);
  }

  toString(): string {
    return `map(${this.options.name ?? ""})`;
  }
}

export class RepositorySet<
  Members extends RepositorySetMembers
> extends Repository<RepositorySetValues<Members>> {
  private readonly members: Members;
  constructor(...members: Members) {
    super({
      defaultValue: members.map(
        (m) => m.defaultValue
      ) as RepositorySetValues<Members>,
      logger: members[0].logger,
    });
    this.members = members;
  }

  protected async readImpl() {
    const results = await Promise.all(this.members);
    return results as RepositorySetValues<Members>;
  }
}

type RepositorySetMembers = [...Repository<any>[]];

type RepositorySetValues<Members extends RepositorySetMembers> = {
  [K in keyof Members]: Members[K] extends RepositoryLike<infer T> ? T : never;
};

type RepositoryLike<T> = PromiseLike<T>;
