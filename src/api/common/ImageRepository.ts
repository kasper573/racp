import * as path from "path";
import Bottleneck from "bottleneck";
import recursiveWatch = require("recursive-watch");
import { ImageFormatter } from "../../lib/image/createImageFormatter";
import { Linker } from "../../lib/fs/createPublicFileLinker";
import { gfs } from "../gfs";
import { ReactiveRepository } from "../../lib/repo/ReactiveRepository";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { decodeRpcFileData, RpcFile } from "./RpcFile";

export type ImageRepositoryOptions = RepositoryOptions<UrlMap> & {
  formatter: ImageFormatter;
  linker: Linker;
};

export class ImageRepository extends ReactiveRepository<UrlMap> {
  get fileExtension() {
    return this.options.formatter.fileExtension;
  }
  get directory() {
    return this.options.linker.directory;
  }

  constructor(private options: ImageRepositoryOptions) {
    super({ ...options, defaultValue: options.defaultValue ?? {} });
  }

  protected observeSource(onSourceChanged: () => void) {
    return recursiveWatch(this.options.linker.directory, onSourceChanged);
  }

  protected async readImpl(): Promise<UrlMap> {
    const { linker } = this.options;
    const names = await gfs.readdir(linker.directory);
    const urlMap = names.reduce((record: Record<string, string>, name) => {
      record[name] = linker.url(name);
      return record;
    }, {});
    return Object.freeze(urlMap);
  }

  size() {
    return this.then((map) => Object.keys(map).length);
  }

  readonly update = async (files: RpcFile[]) => {
    const { linker, formatter } = this.options;
    const newBaseNames = await Promise.all(
      files.map((file) =>
        openFilesBottleneck.schedule(async () => {
          const newFileName = await formatter.write(
            linker.path(path.basename(file.name)),
            Buffer.from(decodeRpcFileData(file.data))
          );
          return path.basename(newFileName);
        })
      )
    );
    return newBaseNames;
  };

  toString(): string {
    return `images(${path.basename(this.directory)})`;
  }
}

export type UrlMap = Readonly<Record<string, string>>;

// 1k max open files is a common OS default. We'll use 900 to be safe.
const openFilesBottleneck = new Bottleneck({ maxConcurrent: 900 });
