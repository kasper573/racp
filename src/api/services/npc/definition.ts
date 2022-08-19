import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../search/types";
import { warpFilter, warpType } from "./types";

export const npcDefinition = createRpcDefinition({
  entries: (builder) =>
    builder.query(
      "searchWarps",
      ...createSearchTypes(warpType, warpFilter.type)
    ),
});
