import * as zod from "zod";
import { toggleRecordType } from "../../util/matcher";
import { getZodType } from "../../../lib/zod/zodPath";
import { LoginEntityType } from "../../rathena/DatabaseDriver.types";

export enum UserAccessLevel {
  Guest,
  User,
  Admin,
}

export const userAccessLevelType = zod.nativeEnum(UserAccessLevel);

export const userProfileType = zod.object({
  id: getZodType(LoginEntityType, "account_id"),
  username: getZodType(LoginEntityType, "userid"),
  email: getZodType(LoginEntityType, "email"),
  access: userAccessLevelType,
});

export type UserProfile = zod.infer<typeof userProfileType>;

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
