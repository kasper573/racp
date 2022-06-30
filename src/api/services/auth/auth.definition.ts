import * as zod from "zod";
import { createRpcDefinition } from "../../../lib/rpc/createRpcDefinition";
import { publicUserType } from "./auth.types";

export const authDefinition = createRpcDefinition({
  entries: (builder) =>
    builder.mutation(
      "login",
      zod.object({
        username: zod.string(),
        password: zod.string(),
      }),
      zod.object({ token: zod.string(), user: publicUserType })
    ),
});
