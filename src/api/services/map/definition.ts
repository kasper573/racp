import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";

const tag = createTagFactory("Map");

export const mapDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder.mutation("uploadMapImage", zod.void(), zod.boolean()),
});
