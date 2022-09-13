import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";

const tag = createTagFactory("Util");

export const utilDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder.fileUpload("decompileLuaTableFiles", zod.record(zod.unknown()), {
      auth: UserAccessLevel.Admin,
    }),
});
