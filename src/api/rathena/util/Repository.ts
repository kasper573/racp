import { Logger } from "../../../lib/logger";

export abstract class Repository<T, Options extends Record<string, any>> {
  protected logger = this.options.logger.chain(this.constructor.name);

  constructor(protected options: { logger: Logger } & Options) {}

  protected abstract readImpl(): Promise<T>;
  protected writeImpl(value: T): Promise<void> {
    throw new Error("Writing not supported");
  }

  readonly read = this.logger.wrap(() => this.readImpl(), "read");
  readonly write = this.logger.wrap(
    (value: T) => this.writeImpl(value),
    "write"
  );
}
