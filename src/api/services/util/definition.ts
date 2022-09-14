import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";
import { reducedLuaTables } from "./types";

const tag = createTagFactory("Util");

export const utilDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder.fileUpload("decompileLuaTableFiles", reducedLuaTables, {
      auth: UserAccessLevel.Admin,
    }),
});
