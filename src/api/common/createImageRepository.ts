import * as path from "path";
import * as fs from "fs";
import { debounce } from "lodash";
import { ImageFormatter } from "../../lib/image/createImageFormatter";
import { Linker } from "../../lib/fs/createPublicFileLinker";
import { Logger } from "../../lib/logger";

export function createImageRepository(
  formatter: ImageFormatter,
  linker: Linker,
  parentLogger: Logger
) {
  const logger = parentLogger.chain("image");
  const urlMap = new Map<string, string>();
  async function updateUrlMap() {
    logger.log("Updating url map");
    urlMap.clear();
    const names = await fs.promises.readdir(linker.directory);
    for (const name of names) {
      urlMap.set(name, linker.url(name));
    }
  }

  const updateUrlMapDebounced = debounce(updateUrlMap, 10);

  let pendingUpdates = 0;
  const watcher = fs.watch(linker.directory, (event) => {
    if (!pendingUpdates && event === "rename") {
      updateUrlMapDebounced();
    }
  });

  async function updateImages(files: Array<{ name: string; data: number[] }>) {
    await Promise.all(
      files.map(
        (file) => () =>
          formatter.write(
            linker.path(path.basename(file.name)),
            Buffer.from(new Uint8Array(file.data))
          )
      )
    );
  }

  async function updateImagesAndSuppressUrlMapUpdates(
    ...args: Parameters<typeof updateImages>
  ) {
    try {
      pendingUpdates++;
      return await updateImages(...args);
    } finally {
      pendingUpdates--;
      updateUrlMap();
    }
  }

  updateUrlMap();

  return {
    urlMap,
    update: updateImagesAndSuppressUrlMapUpdates,
    close: () => watcher.close(),
  };
}
