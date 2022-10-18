import { Logger } from "../logger";

export type RepositoryOptions<T, Required extends boolean> = {
  logger: Logger;
  repositoryName?: string | string[];
} & (Required extends true ? { defaultValue: T } : { defaultValue?: T });

export abstract class Repository<T, Required extends boolean = true> {
  public readonly logger: Logger;
  public readonly defaultValue: RepositoryOptions<T, Required>["defaultValue"];

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
  }: RepositoryOptions<T, Required>) {
    this.logger = [
      this.constructor.name,
      ...(Array.isArray(repositoryName) ? repositoryName : [repositoryName]),
    ].reduce((logger, name) => logger.chain(name), logger);

    this.defaultValue = defaultValue;

    // read/write is commonly used in higher order functions
    this.read = this.read.bind(this);
  }

  protected abstract readImpl(): Promise<this["defaultValue"]>;

  private pendingReadPromise?: Promise<this["defaultValue"]>;
  async read(): Promise<this["defaultValue"]> {
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

  map<Mapped>(
    map: (value: this["defaultValue"]) => Mapped
  ): MappedRepository<this["defaultValue"], Mapped> {
    return new MappedRepository<this["defaultValue"], Mapped>({
      logger: this.logger,
      source: this as Repository<this["defaultValue"], boolean>,
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
  extends RepositoryOptions<Mapped, false> {
  source: Repository<Source, boolean>;
  map: (source?: Source) => Mapped;
}

export class MappedRepository<Source, Mapped> extends Repository<Mapped, true> {
  constructor(private options: MappedRepositoryOptions<Source, Mapped>) {
    super({ defaultValue: options.map(), ...options });
  }

  protected readImpl(): Promise<Mapped> {
    return this.options.source.read().then(this.options.map);
  }
}

export class RepositorySet<
  Members extends RepositorySetMembers
> extends Repository<RepositorySetValues<Members>, true> {
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

type RepositorySetMembers = [...Repository<any, boolean>[]];

type RepositorySetValues<Members extends RepositorySetMembers> = {
  [K in keyof Members]: Members[K] extends RepositoryLike<infer T> ? T : never;
};

type RepositoryLike<T> = { read(): Promise<T> };
