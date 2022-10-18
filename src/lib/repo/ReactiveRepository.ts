import { debounce } from "lodash";
import { CachedRepository } from "./CachedRepository";
import { Maybe } from "./Repository";

export abstract class ReactiveRepository<
  T,
  DefaultValue extends Maybe<T> = T
> extends CachedRepository<T, DefaultValue> {
  private stopObserving?: () => void;

  protected abstract observeSource(onSourceChanged: Function): () => void;

  initialize() {
    super.initialize();
    this.stopObserving = this.observeSource(this.handleSourceChange);
  }

  dispose() {
    super.dispose();
    this.stopObserving?.();
    this.stopObserving = undefined;
  }

  private handleSourceChange = debounce(() => this.clearCache(), 50, {
    maxWait: 1000,
  });
}
