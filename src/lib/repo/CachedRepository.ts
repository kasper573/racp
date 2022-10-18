import { MutableRepository } from "./MutableRepository";
import { RepositoryOptions } from "./Repository";

export abstract class CachedRepository<
  T,
  Required extends boolean
> extends MutableRepository<T, Required> {
  private cache?: { value: RepositoryOptions<T, Required>["defaultValue"] };

  async read() {
    if (!this.cache) {
      this.cache = { value: (await super.read())! };
    }
    return this.cache.value;
  }

  async write(value: this["defaultValue"]) {
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
    this.logger.log("Cache cleared");
    this.cache = undefined;
  }

  dispose() {
    super.dispose();
    this.clearCache();
  }
}
