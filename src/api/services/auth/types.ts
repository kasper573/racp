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

export type UserProfile = zod.infer<typeof userProfileType>;
export const userProfileType = zod.object({
  id: getZodType(LoginEntityType, "account_id"),
  username: getZodType(LoginEntityType, "userid"),
  email: getZodType(LoginEntityType, "email"),
  access: userAccessLevelType,
});

export type UserProfileMutation = zod.infer<typeof userProfileMutationType>;
export const userProfileMutationType = zod.object({
  email: getZodType(LoginEntityType, "email"),
  password: getZodType(LoginEntityType, "user_pass"),
  passwordConfirm: getZodType(LoginEntityType, "user_pass"),
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
