import { createRpcController } from "../../../lib/rpc/createRpcController";
import { Logger } from "../../../lib/logger";
import { mapDefinition } from "./definition";

export async function mapController(logger: Logger) {
  return createRpcController(mapDefinition.entries, {
    uploadMapImages: async (files) => {
      return true;
    },
  });
}
