import * as path from "path";
import * as fs from "fs";
import Bottleneck from "bottleneck";
import { debounce } from "lodash";
import { ImageFormatter } from "../../lib/image/createImageFormatter";
import { Linker } from "../../lib/fs/createPublicFileLinker";
import { Logger } from "../../lib/logger";
import { gfs } from "../util/gfs";
import { RpcFile } from "./RpcFile";

export function createImageRepository(
  formatter: ImageFormatter,
  linker: Linker,
  parentLogger: Logger
) {
  const logger = parentLogger.chain("image");
  let urlMap: UrlMap = {};

  async function updateUrlMap() {
    logger.log("Updating url map");
    const names = await gfs.readdir(linker.directory);
    urlMap = createUrlMap(names);
  }

  function createUrlMap(names: string[]): UrlMap {
    const record = names.reduce((record: Record<string, string>, name) => {
      record[name] = linker.url(name);
      return record;
    }, {});
    return Object.freeze(record);
  }

  const updateUrlMapDebounced = debounce(updateUrlMap, 10);

  let pendingUpdates = 0;
  const watcher = fs.watch(linker.directory, (event) => {
    if (!pendingUpdates && event === "rename") {
      updateUrlMapDebounced();
    }
  });

  async function updateImages(files: RpcFile[]) {
    await Promise.all(
      files.map((file) =>
        openFilesBottleneck.schedule(() =>
          formatter.write(
            linker.path(path.basename(file.name)),
            Buffer.from(new Uint8Array(file.data))
          )
        )
      )
    );
  }

  async function updateImagesAndSuppressUrlMapUpdates(files: RpcFile[]) {
    try {
      pendingUpdates++;
      return await updateImages(files);
    } finally {
      pendingUpdates--;
      updateUrlMap();
    }
  }

  updateUrlMap();

  return {
    get urlMap() {
      return urlMap;
    },
    update: updateImagesAndSuppressUrlMapUpdates,
    close: () => watcher.close(),
  };
}

export type UrlMap = Readonly<Record<string, string>>;

// 1k max open files is a common OS default. We'll use 900 to be safe.
const openFilesBottleneck = new Bottleneck({ maxConcurrent: 900 });
