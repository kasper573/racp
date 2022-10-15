import * as path from "path";
import recursiveWatch = require("recursive-watch");
import { gfs } from "../../api/gfs";
import { ensureDir } from "../fs/ensureDir";
import { ReactiveRepository } from "./ReactiveRepository";
import { RepositoryOptions } from "./Repository";

export interface FileRepositoryOptions<Data>
  extends Omit<RepositoryOptions<Data>, "defaultValue"> {
  directory: string;
  relativeFilename: string;
  protocol: FileProtocol<Data>;
}

export class FileRepository<Data> extends ReactiveRepository<Data | undefined> {
  private readonly filename: string;

  constructor(private options: FileRepositoryOptions<Data>) {
    super({ defaultValue: undefined, ...options });

    ensureDir(this.options.directory);
    this.logger = this.logger.chain(options.relativeFilename);
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

  protected async writeImpl(data?: Data) {
    if (data === undefined) {
      await gfs.rm(this.filename);
    } else {
      gfs.writeFile(
        this.filename,
        this.options.protocol.serialize(data),
        "utf-8"
      );
    }
  }

  async assign(changes: Data) {
    const current = await this.read();
    const updated = { ...current, ...changes };
    await this.write(updated);
    return updated;
  }
}

export interface FileProtocol<Data> {
  parse: (fileContent: string) => FileParseResult<Data>;
  serialize: (data: Data) => string;
}

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };
