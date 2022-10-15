import { debounce } from "lodash";
import { CachedRepository } from "./CachedRepository";

export abstract class ReactiveRepository<T> extends CachedRepository<T> {
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
