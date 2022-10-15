import { CachedRepository } from "./CachedRepository";
import { RepositoryOptions } from "./Repository";

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
