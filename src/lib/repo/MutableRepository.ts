import { Maybe, Repository, RepositoryOptions } from "./Repository";

export abstract class MutableRepository<
  T,
  DefaultValue extends Maybe<T> = T
> extends Repository<T, DefaultValue> {
  constructor(options: RepositoryOptions<T, DefaultValue>) {
    super(options);
    // read/write is commonly used in higher order functions
    this.write = this.write.bind(this);
  }

  protected writeImpl(value: T | DefaultValue): Promise<void> {
    throw new Error("Write not supported");
  }

  async write(value: T | DefaultValue): Promise<boolean> {
    try {
      await this.logger.track(this.writeImpl(value), "write");
      return true;
    } catch (e) {
      this.logger.error("Failed to write:", e);
      return false;
    }
  }

  transform(createValue: (currentValue: T | DefaultValue) => DefaultValue) {
    return this.read().then((currentValue) =>
      this.write(createValue(currentValue))
    );
  }
}
