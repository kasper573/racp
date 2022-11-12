import { MutableRepository } from "./MutableRepository";
import { Maybe } from "./Repository";

export abstract class CachedRepository<
  T,
  DefaultValue extends Maybe<T>
> extends MutableRepository<T, DefaultValue> {
  private cache?: { value: T | DefaultValue };

  async read() {
    if (!this.cache) {
      this.cache = { value: (await super.read())! };
    }
    return this.cache.value;
  }

  async write(value: T | DefaultValue) {
    const previousCache = this.cache;
    this.cache = { value };
    try {
      await super.write(value);
    } catch (e) {
      // Revert cache if writing fails
      this.cache = previousCache;
      throw e;
    }
  }

  clearCache() {
    this.cache = undefined;
  }

  dispose() {
    super.dispose();
    this.clearCache();
  }
}
