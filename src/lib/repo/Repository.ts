import { Logger } from "../logger";

export type Maybe<T> = T | undefined;

export type RepositoryOptions<T, DefaultValue extends Maybe<T> = undefined> = {
  logger: Logger;
  defaultValue?: DefaultValue;
  logReads?: boolean;
};

export abstract class Repository<T, DefaultValue extends Maybe<T> = T>
  implements PromiseLike<T | DefaultValue>
{
  public readonly defaultValue: DefaultValue;
  protected readonly logReads: boolean;

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
    return (
      this._logger ?? (this._logger = this._inputLogger.chain(this.toString()))
    );
  }

  protected constructor({
    logger,
    defaultValue,
    logReads = true,
  }: RepositoryOptions<T, DefaultValue>) {
    this._inputLogger = logger;
    this.defaultValue = defaultValue as DefaultValue;
    this.logReads = logReads;

    // read is commonly used in higher order functions
    this.read = this.read.bind(this);
  }

  protected abstract readImpl(): Promise<T | undefined>;

  private pendingReadPromise?: Promise<T | DefaultValue>;
  async read(): Promise<T | DefaultValue> {
    if (!this.pendingReadPromise) {
      let promise = this.readImpl();
      if (this.logReads) {
        promise = this.logger.track(promise, "read");
      }
      this.pendingReadPromise = promise
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
    map: (value: T | DefaultValue) => Mapped,
    getDependencyList = (value?: T | DefaultValue) => [value]
  ): MappedRepository<T | DefaultValue, Mapped> {
    return new MappedRepository<T | DefaultValue, Mapped>({
      logger: this.logger,
      source: this as Repository<T | DefaultValue>,
      map: (val) => map(val ?? this.defaultValue),
      getDependencyList,
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

  toString() {
    return this.constructor.name;
  }
}

export interface MappedRepositoryOptions<Source, Mapped>
  extends RepositoryOptions<Mapped> {
  source: Repository<Source>;
  map: (source?: Source) => Mapped;
  getDependencyList: (source?: Source) => DependencyList;
  name?: string;
}

export class MappedRepository<Source, Mapped> extends Repository<Mapped> {
  private cache?: { deps: DependencyList; value: Mapped };
  private mapWithLogging = this.logger.wrap(this.options.map, "map");

  constructor(private options: MappedRepositoryOptions<Source, Mapped>) {
    super({ defaultValue: options.map(), logReads: false, ...options });
  }

  protected async readImpl(): Promise<Mapped> {
    const source = await this.options.source;
    const deps = this.options.getDependencyList(source);
    if (!this.cache || !depsEqual(deps, this.cache.deps)) {
      this.cache = {
        deps,
        value: this.logger.wrap(() => this.options.map(source), "")(),
      };
    }
    return this.cache.value;
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
      logReads: false,
    });
    this.members = members;
  }

  map<Mapped>(
    name: string,
    map: (value: RepositorySetValues<Members>) => Mapped
  ) {
    return super.map(name, map, (values) => values ?? []);
  }

  protected async readImpl() {
    const results = await Promise.all(this.members);
    return results as RepositorySetValues<Members>;
  }

  toString() {
    return `set[${this.members.length}]`;
  }
}

type RepositorySetMembers = [...Repository<any>[]];

type RepositorySetValues<Members extends RepositorySetMembers> = {
  [K in keyof Members]: Members[K] extends RepositoryLike<infer T> ? T : never;
};

type RepositoryLike<T> = PromiseLike<T>;

export type DependencyList = unknown[];

function depsEqual(a: DependencyList, b: DependencyList) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
