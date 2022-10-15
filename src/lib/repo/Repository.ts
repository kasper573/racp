import { Logger } from "../logger";

export interface RepositoryOptions<T> {
  logger: Logger;
  defaultValue: T;
  repositoryName?: string | string[];
}

export abstract class Repository<T> {
  protected readonly logger: Logger;
  protected readonly defaultValue: T;

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

  dispose() {
    this.logger.log("Disposed");
  }
}
