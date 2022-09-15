import * as zod from "zod";
import { createRpcDefinition } from "../../util/rpc";
import {
  userAccessLevelType,
  userProfileMutationType,
  userProfileType,
} from "./types";

const myProfileTag = "MY_PROFILE";

export const authDefinition = createRpcDefinition({
  tagTypes: [myProfileTag],
  entries: (builder) =>
    builder
      .mutation(
        "login",
        zod.object({ username: zod.string(), password: zod.string() }),
        zod.object({
          token: zod.string(),
          access: userAccessLevelType,
        }),
        { tags: [myProfileTag] }
      )
      .query("getMyProfile", zod.void(), userProfileType.optional(), {
        tags: [myProfileTag],
      })
      .mutation("updateMyProfile", userProfileMutationType, zod.boolean(), {
        tags: (success) => (success ? [myProfileTag] : []),
      }),
});
