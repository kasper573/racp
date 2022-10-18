import { Logger } from "../logger";

export type Maybe<T> = T | undefined;

export type RepositoryOptions<T, DefaultValue extends Maybe<T> = undefined> = {
  logger: Logger;
  repositoryName?: string | string[];
  defaultValue?: DefaultValue;
};

export abstract class Repository<T, DefaultValue extends Maybe<T> = T>
  implements PromiseLike<T | DefaultValue>
{
  public readonly logger: Logger;
  public readonly defaultValue: DefaultValue;

  private _isInitialized = false;
  private _isDisposed = false;

  get isInitialized() {
    return this._isInitialized;
  }

  get isDisposed() {
    return this._isDisposed;
  }

  protected constructor({
    logger,
    repositoryName = [],
    defaultValue,
  }: RepositoryOptions<T, DefaultValue>) {
    this.logger = [
      this.constructor.name,
      ...(Array.isArray(repositoryName) ? repositoryName : [repositoryName]),
    ].reduce((logger, name) => logger.chain(name), logger);

    this.defaultValue = defaultValue as DefaultValue;

    // read/write is commonly used in higher order functions
    this.read = this.read.bind(this);
  }

  protected abstract readImpl(): Promise<T | DefaultValue>;

  private pendingReadPromise?: Promise<T | DefaultValue>;
  protected async read(): Promise<T | DefaultValue> {
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
    map: (value: T | DefaultValue) => Mapped
  ): MappedRepository<T | DefaultValue, Mapped> {
    return new MappedRepository<T | DefaultValue, Mapped>({
      logger: this.logger,
      source: this as Repository<T | DefaultValue>,
      map: (val) => map(val ?? this.defaultValue),
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

export interface MappedRepositoryOptions<Source, Mapped>
  extends RepositoryOptions<Mapped, undefined> {
  source: Repository<Source, any>;
  map: (source?: Source) => Mapped;
}

export class MappedRepository<Source, Mapped> extends Repository<Mapped> {
  constructor(private options: MappedRepositoryOptions<Source, Mapped>) {
    super({ defaultValue: options.map(), ...options });
  }

  protected readImpl(): Promise<Mapped> {
    return this.options.source.then(this.options.map);
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
