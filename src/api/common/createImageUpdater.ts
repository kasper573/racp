import * as path from "path";
import { ImageFormatter } from "../../lib/createImageFormatter";
import { Linker } from "../../lib/createPublicFileLinker";

export function createImageUpdater(formatter: ImageFormatter, linker: Linker) {
  async function updateImages(files: Array<{ name: string; data: number[] }>) {
    await Promise.all(
      files.map((file) =>
        formatter.write(
          linker.path(path.basename(file.name)),
          Buffer.from(new Uint8Array(file.data))
        )
      )
    );
  }
  return updateImages;
}
