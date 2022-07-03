import * as zod from "zod";
import { LoginEntityType } from "../radb.types";
import { toggleRecordType } from "../../util/matchers";

export const publicUserType = LoginEntityType.pick({
  account_id: true,
  userid: true,
  group_id: true,
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
