import * as path from "path";
import recursiveWatch = require("recursive-watch");
import { gfs } from "../../api/gfs";
import { ensureDir } from "../fs/ensureDir";
import { ReactiveRepository } from "./ReactiveRepository";
import { RepositoryOptions } from "./Repository";

export type FileRepositoryOptions<
  T,
  Required extends boolean
> = RepositoryOptions<T, Required> & {
  directory: string;
  relativeFilename: string;
  protocol: FileProtocol<T>;
};

export class FileRepository<
  T,
  Required extends boolean = false
> extends ReactiveRepository<T, Required> {
  readonly filename: string;

  constructor(private options: FileRepositoryOptions<T, Required>) {
    super({
      repositoryName: options.relativeFilename,
      ...options,
    });

    ensureDir(this.options.directory);
    this.filename = path.resolve(
      this.options.directory,
      this.options.relativeFilename
    );
  }

  protected observeSource(onSourceChanged: () => void) {
    return recursiveWatch(this.options.directory, (changedFile) => {
      if (changedFile === this.options.relativeFilename) {
        onSourceChanged();
      }
    });
  }

  protected async readImpl() {
    let fileContent: string | undefined;
    try {
      fileContent = await gfs.readFile(this.filename, "utf-8");
    } catch {
      // File missing = content undefined
    }

    if (fileContent === undefined) {
      return;
    }

    const result = this.options.protocol.parse(fileContent);
    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  protected async writeImpl(data: this["defaultValue"]) {
    if (data === undefined) {
      await gfs.rm(this.filename);
    } else {
      await gfs.writeFile(
        this.filename,
        this.options.protocol.serialize(data as T),
        "utf-8"
      );
    }
  }

  readonly assign = async (changes: T) => {
    const current = await this.read();
    const updated = { ...current, ...changes };
    await this.write(updated);
    return updated;
  };
}

export interface FileProtocol<Data> {
  parse: (fileContent: string) => FileParseResult<Data>;
  serialize: (data: Data) => string;
}

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };
