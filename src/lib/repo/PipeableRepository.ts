import { Maybe } from "./Repository";
import { ReactiveRepository } from "./ReactiveRepository";

export type AnyPipeableRepository = PipeableRepository<any, any>;
export abstract class PipeableRepository<
  PipeInput,
  T,
  DefaultValue extends Maybe<T> = T
> extends ReactiveRepository<T, DefaultValue> {
  private stopObservingPipedSource?: () => void;
  private source?: ReactiveRepository<PipeInput>;
  private _pipeInput?: PipeInput;
  protected get pipeInput(): PipeInput {
    if (this._pipeInput === undefined) {
      throw new Error("Pipe input is not available");
    }
    return this._pipeInput;
  }

  setPipeSource(source: ReactiveRepository<PipeInput>) {
    this.stopObservingPipedSource?.();
    this.stopObservingPipedSource = source.observe(() => this.clearCache());
    this.source = source;
  }

  async read() {
    if (!this.source) {
      throw new Error(
        "Cannot read from pipeable repository before a source is set"
      );
    }
    this._pipeInput = await this.source;
    return super.read();
  }

  dispose() {
    super.dispose();
    this.stopObservingPipedSource?.();
  }
}
