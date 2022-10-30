import { MutableRepository } from "./MutableRepository";
import { Maybe, Repository } from "./Repository";
import { Atom } from "./Atom";

export abstract class CachedRepository<
  T,
  DefaultValue extends Maybe<T>
> extends MutableRepository<T, DefaultValue> {
  private cache?: { value: T | DefaultValue };
  private pipes: Pipe<any, any>[] = [];

  async read() {
    if (!this.cache) {
      this.cache = { value: (await super.read())! };
    }
    return this.cache.value;
  }

  async write(value: T | DefaultValue) {
    const previousCache = this.cache;
    this.cache = { value };
    const success = await super.write(value);
    if (!success) {
      // Revert cache if writing fails
      this.cache = previousCache;
    }
    return success;
  }

  pipe<Target extends AnyCachedRepository>(
    target: Target,
    inserter: PipeInserter<this, Target> = defaultInserter
  ) {
    const pipe = new Pipe(this, target, inserter);
    this.pipes.push(pipe);
    pipe.flush();
    return target;
  }

  clearCache() {
    this.pipes.forEach((p) => p.flush());
    this.cache = undefined;
  }

  dispose() {
    super.dispose();
    this.pipes = [];
    this.clearCache();
  }
}

const defaultInserter: PipeInserter<AnyCachedRepository, any> = (
  input,
  target,
  source
) => {
  if (input && typeof input === "object") {
    let wasChanged = false;
    for (const [key, newValue] of Object.entries(input)) {
      if (!Object.hasOwn(target, key)) {
        continue;
      }
      const targetKey = key as keyof typeof target;
      let previousValue: unknown;
      if (target[targetKey] instanceof Atom) {
        const atom = target[targetKey];
        previousValue = atom.get(true);
        atom.set(newValue);
      } else {
        previousValue = target[key];
        target[key] = newValue;
      }
      if (previousValue !== newValue) {
        wasChanged = true;
      }
    }
    return wasChanged;
  } else {
    source.logger.error(
      "Default pipe inserter can only insert object types. Received:",
      input
    );
    return false;
  }
};

class Pipe<
  Source extends AnyCachedRepository,
  Target extends AnyCachedRepository
> {
  constructor(
    private readonly source: Source,
    public readonly target: Target,
    private readonly insert: PipeInserter<Source, Target>
  ) {}

  async flush() {
    const sourceOutput = await this.source.read();
    const wasChanged = this.insert(sourceOutput, this.target, this.source);
    if (wasChanged) {
      this.source.logger.log("Flushed pipe ->", this.target.toString());
      this.target.clearCache();
    }
  }
}

type RepositoryOutput<T> = T extends Repository<infer U> ? U : never;
type AnyCachedRepository = CachedRepository<any, any>;
interface PipeInserter<Source extends AnyCachedRepository, Target> {
  (
    sourceOutput: RepositoryOutput<Source>,
    target: Target,
    source: Source
  ): boolean;
}
