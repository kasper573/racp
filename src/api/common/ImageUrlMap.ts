import * as path from "path";
import Bottleneck from "bottleneck";
import recursiveWatch = require("recursive-watch");
import { ImageFormatter } from "../../lib/image/createImageFormatter";
import { Linker } from "../../lib/fs/createPublicFileLinker";
import { gfs } from "../gfs";
import { ReactiveRepository } from "../../lib/repo/ReactiveRepository";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { decodeRpcFileData, RpcFile } from "./RpcFile";

export interface ImageUrlMapOptions
  extends Omit<RepositoryOptions<UrlMap>, "defaultValue"> {
  formatter: ImageFormatter;
  linker: Linker;
}

export class ImageUrlMap extends ReactiveRepository<UrlMap> {
  constructor(private options: ImageUrlMapOptions) {
    super({ defaultValue: {}, ...options });
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

  readonly update = async (files: RpcFile[]) => {
    await Promise.all(
      files.map((file) =>
        openFilesBottleneck.schedule(() =>
          this.options.formatter.write(
            this.options.linker.path(path.basename(file.name)),
            Buffer.from(decodeRpcFileData(file.data))
          )
        )
      )
    );
  };
}

export type UrlMap = Readonly<Record<string, string>>;

// 1k max open files is a common OS default. We'll use 900 to be safe.
const openFilesBottleneck = new Bottleneck({ maxConcurrent: 900 });
