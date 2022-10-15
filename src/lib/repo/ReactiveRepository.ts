import { debounce } from "lodash";
import { CachedRepository } from "./CachedRepository";
import { RepositoryOptions } from "./Repository";

export abstract class ReactiveRepository<T> extends CachedRepository<T> {
  private stopObserving?: () => void;

  protected constructor({ ...rest }: RepositoryOptions<T>) {
    super(rest);

    // TODO remove this and replace with manual restart of all repositories in server.ts
    setTimeout(() => this.start(), 0);
  }

  protected abstract observeSource(onSourceChanged: Function): () => void;

  start() {
    this.stop();
    this.stopObserving = this.observeSource(this.handleSourceChange);
  }

  stop() {
    this.stopObserving?.();
    this.stopObserving = undefined;
  }

  dispose() {
    this.stop();
    super.dispose();
  }

  private handleSourceChange = debounce(() => this.clearCache(), 50, {
    maxWait: 1000,
  });
}
