import { EventEmitter } from "events";
import { debounce } from "lodash";
import { CachedRepository } from "./CachedRepository";
import { Maybe } from "./Repository";
import { AnyPipeableRepository } from "./PipeableRepository";

export abstract class ReactiveRepository<
  T,
  DefaultValue extends Maybe<T> = T
> extends CachedRepository<T, DefaultValue> {
  private stopObservingSource?: () => void;
  private eventEmitter = new EventEmitter();

  protected abstract observeSource(onSourceChanged: Function): () => void;

  observe(onChange: () => void) {
    this.eventEmitter.on(eventName, onChange);
    return () => this.eventEmitter.off(eventName, onChange);
  }

  initialize() {
    super.initialize();
    this.stopObservingSource = this.observeSource(() =>
      this.eventEmitter.emit(eventName)
    );
    this.eventEmitter.on(eventName, this.debouncedCacheClear);
  }

  pipe<Target extends AnyPipeableRepository>(target: Target) {
    target.setPipeSource(this);
    return target;
  }

  dispose() {
    super.dispose();
    this.stopObservingSource?.();
    this.stopObservingSource = undefined;
    this.eventEmitter.removeAllListeners();
  }

  private debouncedCacheClear = debounce(() => this.clearCache(), 50, {
    maxWait: 1000,
  });
}

const eventName = "change";
