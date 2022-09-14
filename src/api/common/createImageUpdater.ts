import * as path from "path";
import { ImageFormatter } from "../../lib/createImageFormatter";
import { Linker } from "../../lib/createPublicFileLinker";

export function createImageUpdater(
  formatter: ImageFormatter,
  linker: Linker,
  onUpdate?: () => void
) {
  async function updateImages(
    files: Array<{ name: string; data: Uint8Array }>
  ) {
    const all = await Promise.allSettled(
      files.map((file) =>
        formatter.write(
          linker.path(path.basename(file.name)),
          Buffer.from(file.data)
        )
      )
    );
    const success = all.filter((r) => r.status === "fulfilled").length;
    const failed = all.length - success;
    onUpdate?.();
    return { success, failed };
  }
  return updateImages;
}
