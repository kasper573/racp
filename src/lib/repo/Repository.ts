import { Logger } from "../logger";

export interface RepositoryOptions<T> {
  logger: Logger;
  defaultValue: T;
  repositoryName?: string | string[];
}

export abstract class Repository<T> {
  protected readonly logger: Logger;
  protected readonly defaultValue: T;

  private _isInitialized = false;
  private _isDisposed = false;

  get isInitialized() {
    return this._isInitialized;
  }

  get isDisposed() {
    return this._isDisposed;
  }

  constructor({
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
    this.write = this.write.bind(this);

    // TODO remove this and replace with manual init of all repositories in server.ts
    setTimeout(() => this.initialize(), 0);
  }

  protected abstract readImpl(): Promise<T | undefined>;
  protected writeImpl(value?: T): Promise<void> {
    throw new Error("Writing not supported");
  }

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

  async write(value: T): Promise<boolean> {
    try {
      await this.logger.track(this.writeImpl(value), "write");
      return true;
    } catch (e) {
      this.logger.error("Failed to write:", e);
      return false;
    }
  }

  transform(createValue: (currentValue: T) => T) {
    return this.read().then((currentValue) =>
      this.write(createValue(currentValue))
    );
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