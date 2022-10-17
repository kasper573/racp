import { Logger } from "../logger";

export interface RepositoryOptions<T> {
  logger: Logger;
  defaultValue: T;
  repositoryName?: string | string[];
}

export abstract class Repository<T = any> {
  public readonly logger: Logger;
  public readonly defaultValue: T;

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
  }: RepositoryOptions<T>) {
    this.logger = [
      this.constructor.name,
      ...(Array.isArray(repositoryName) ? repositoryName : [repositoryName]),
    ].reduce((logger, name) => logger.chain(name), logger);

    this.defaultValue = defaultValue;

    // read/write is commonly used in higher order functions
    this.read = this.read.bind(this);
  }

  protected abstract readImpl(): Promise<T | undefined>;

  private pendingReadPromise?: Promise<T>;
  async read(): Promise<T> {
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

  map<Mapped>(map: (value: T) => Mapped) {
    return new MappedRepository<T, Mapped>({
      logger: this.logger,
      source: this,
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

    // TODO remove this and replace with manual read of all repositories in server.ts
    this.read();
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
  extends Omit<RepositoryOptions<Mapped>, "defaultValue"> {
  source: Repository<Source>;
  map: (source?: Source) => Mapped;
}

export class MappedRepository<Source, Mapped> extends Repository<Mapped> {
  constructor(private options: MappedRepositoryOptions<Source, Mapped>) {
    super({ defaultValue: options.map(), ...options });
  }

  protected readImpl(): Promise<Mapped> {
    return this.options.source.read().then(this.options.map);
  }
}

export class RepositorySet<
  Members extends RepositorySetMembers
> extends Repository<RepositorySetValues<Members>> {
  private members: Members;
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
    const results = await Promise.all(this.members.map((m) => m.read()));
    return results as RepositorySetValues<Members>;
  }
}

type RepositorySetMembers = [...Repository[]];

type RepositorySetValues<Members extends RepositorySetMembers> = {
  [K in keyof Members]: Members[K] extends RepositoryLike<infer T> ? T : never;
};

type RepositoryLike<T> = { read(): Promise<T> };
