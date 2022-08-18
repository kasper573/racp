import { createRpcController } from "../../../lib/rpc/createRpcController";
import { Logger } from "../../../lib/logger";
import { mapDefinition } from "./definition";

export async function mapController(logger: Logger) {
  return createRpcController(mapDefinition.entries, {
    uploadMapImage: async (file) => {
      logger.log("received file", file);
      return true;
    },
  });
}
