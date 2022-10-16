import { MutableRepository } from "./MutableRepository";

export abstract class CachedRepository<T> extends MutableRepository<T> {
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
    this.logger.log("Cache cleared");
    this.cache = undefined;
  }

  dispose() {
    super.dispose();
    this.clearCache();
  }
}
