import * as path from "path";
import * as fs from "fs";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { mapDefinition } from "./definition";

export async function mapController({
  mapImagesDir,
}: {
  mapImagesDir: string;
}) {
  return createRpcController(mapDefinition.entries, {
    async countMapImages() {
      return fs.readdirSync(mapImagesDir).length;
    },
    async uploadMapImages(files) {
      const all = await Promise.allSettled(
        files.map((file) =>
          fs.promises.writeFile(
            path.resolve(mapImagesDir, path.basename(file.name)),
            new Uint8Array(file.data)
          )
        )
      );
      const success = all.filter((r) => r.status === "fulfilled").length;
      const failed = all.length - success;
      return { success, failed };
    },
  });
}
