import * as path from "path";
import * as fs from "fs";
import { EventEmitter } from "events";
import recursiveWatch = require("recursive-watch");
import TypedEmitter from "typed-emitter";
import { ensureDir } from "../fs/ensureDir";
import { ReactiveRepository } from "./ReactiveRepository";
import { Maybe, RepositoryOptions } from "./Repository";

export type FileRepositoryOptions<
  T,
  DefaultValue extends Maybe<T> = undefined
> = RepositoryOptions<T, DefaultValue> & {
  directory: string;
  relativeFilename: string;
  protocol: FileProtocol<T>;
};

export type FileRepositoryEvents<T, DefaultValue extends Maybe<T>> = {
  loadParseError: (fileContent: string, error: unknown) => void;
  loadSuccess: (
    fileContent: string,
    parsedContent: T,
    defaultContent: DefaultValue
  ) => void;
  write: (data: T | DefaultValue) => void;
};

export class FileRepository<
  T,
  DefaultValue extends Maybe<T> = Maybe<T>
> extends ReactiveRepository<T, DefaultValue> {
  readonly filename: string;
  readonly events = new EventEmitter() as TypedEmitter<
    FileRepositoryEvents<T, DefaultValue>
  >;

  constructor(private options: FileRepositoryOptions<T, DefaultValue>) {
    super(options);

    ensureDir(this.options.directory);
    this.filename = path.resolve(
      this.options.directory,
      this.options.relativeFilename
    );
  }

  protected observeSource(onSourceChanged: () => void) {
    return recursiveWatch(this.options.directory, (changedFile) => {
      if (changedFile === this.filename) {
        onSourceChanged();
      }
    });
  }

  protected async readImpl() {
    let fileContent: string | undefined;
    try {
      fileContent = await fs.promises.readFile(this.filename, "utf-8");
    } catch {
      // File missing = content undefined
    }

    if (fileContent === undefined) {
      return this.defaultValue;
    }

    const result = this.options.protocol.parse(fileContent);
    if (!result.success) {
      this.events.emit("loadParseError", fileContent, result.error);
      throw new Error(`Could not parse file content: ${result.error}`);
    }

    this.events.emit(
      "loadSuccess",
      fileContent,
      result.data,
      this.defaultValue
    );

    return result.data ?? this.defaultValue;
  }

  protected async writeImpl(data: T | DefaultValue) {
    if (data === undefined) {
      if (fs.existsSync(this.filename)) {
        await fs.promises.rm(this.filename);
      }
    } else {
      await fs.promises.writeFile(
        this.filename,
        this.options.protocol.serialize(data as T),
        "utf-8"
      );
    }
    this.events.emit("write", data);
  }

  readonly assign = async (changes: T) => {
    const current = await this;
    const updated = { ...current, ...changes };
    await this.write(updated);
    return updated;
  };

  dispose() {
    super.dispose();
    this.events.removeAllListeners();
  }

  toString() {
    return `file(${path.basename(this.options.directory)}/${
      this.options.relativeFilename
    })`;
  }
}

export interface FileProtocol<Data> {
  parse: (fileContent: string) => FileParseResult<Data>;
  serialize: (data: Data) => string;
}

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };
