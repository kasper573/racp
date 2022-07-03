import * as zod from "zod";
import { toggleRecordType } from "../../util/matchers";
import { getZodType } from "../../../lib/zod/zodPath";
import { LoginEntityType } from "../radb.types";

export const publicUserType = zod.object({
  id: getZodType(LoginEntityType, "account_id"),
  username: getZodType(LoginEntityType, "userid"),
  isAdmin: zod.boolean(),
});

export const userGroupType = zod.object({
  Id: zod.number(),
  Name: zod.string(),
  Level: zod.number(),
  LogCommands: zod.boolean().default(false),
  Commands: toggleRecordType,
  CharCommands: toggleRecordType,
  Permissions: toggleRecordType,
  Inherit: toggleRecordType,
});
