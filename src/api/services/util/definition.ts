import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";

const tag = createTagFactory("Util");

export const utilDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder.fileUpload("decompileLuaTableFiles", zod.record(zod.unknown())),
});
