import { Logger } from "./logger";

export interface RepositoryOptions<T> {
  logger: Logger;
  defaultValue: T;
}

export abstract class Repository<T> {
  protected logger: Logger;
  protected readonly defaultValue: T;

  constructor({ logger, defaultValue }: RepositoryOptions<T>) {
    this.logger = logger.chain(this.constructor.name);
    this.defaultValue = defaultValue;
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

export abstract class CachedRepository<T> extends Repository<T> {
  private cache?: { value: T };

  async read() {
    if (!this.cache) {
      this.cache = { value: await super.read() };
    }
    return this.cache.value;
  }

  async write(value: T) {
    const previousCache = this.cache;
    this.cache = { value };
    const success = await super.write(value);
    if (!success) {
      // Revert cache if writing fails
      this.cache = previousCache;
    }
    return success;
  }

  clearCache() {
    this.cache = undefined;
  }

  dispose() {
    this.clearCache();
    super.dispose();
  }
}

export interface ReactiveRepositoryOptions<T> extends RepositoryOptions<T> {
  startImmediately?: boolean;
}

export abstract class ReactiveRepository<T> extends CachedRepository<T> {
  private stopObserving?: () => void;

  protected constructor({
    startImmediately = true,
    ...rest
  }: ReactiveRepositoryOptions<T>) {
    super(rest);
    if (startImmediately) {
      this.start();
    }
  }

  protected abstract observeSource(onSourceChanged: Function): () => void;

  start() {
    this.stop();
    this.stopObserving = this.observeSource(() => this.clearCache());
  }

  stop() {
    this.stopObserving?.();
    this.stopObserving = undefined;
  }

  dispose() {
    this.stop();
    super.dispose();
  }
}
