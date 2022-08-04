import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { metaType } from "./types";

const tag = createTagFactory("Meta");

export const metaDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) => builder.query("getMeta", zod.void(), metaType),
});
