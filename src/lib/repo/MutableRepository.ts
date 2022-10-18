import { Repository, RepositoryOptions } from "./Repository";

export abstract class MutableRepository<
  T,
  Required extends boolean
> extends Repository<T, Required> {
  constructor(options: RepositoryOptions<T, Required>) {
    super(options);
    // read/write is commonly used in higher order functions
    this.write = this.write.bind(this);
  }

  protected writeImpl(value: this["defaultValue"]): Promise<void> {
    throw new Error("Write not supported");
  }

  async write(value: this["defaultValue"]): Promise<boolean> {
    try {
      await this.logger.track(this.writeImpl(value), "write");
      return true;
    } catch (e) {
      this.logger.error("Failed to write:", e);
      return false;
    }
  }

  transform(createValue: (currentValue?: T) => T) {
    return this.read().then((currentValue) =>
      this.write(createValue(currentValue))
    );
  }
}
