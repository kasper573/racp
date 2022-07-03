import * as zod from "zod";
import { LoginEntityType } from "../radb.types";

export const publicUserType = LoginEntityType.pick({
  account_id: true,
  userid: true,
  group_id: true,
});

export type UserGroupId = Exclude<PublicUser["group_id"], undefined>;
export type PublicUser = zod.infer<typeof publicUserType>;
