import * as zod from "zod";
import { createRpcDefinition } from "../../util/rpc";
import { publicUserType } from "./types";

export const authDefinition = createRpcDefinition({
  entries: (builder) =>
    builder.mutation(
      "login",
      zod.object({ username: zod.string(), password: zod.string() }),
      zod.object({ token: zod.string(), user: publicUserType })
    ),
});
