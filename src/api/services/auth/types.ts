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
export const usernameType = zod.string().min(4).max(12);
export const emailType = zod.string().email();
export const passwordType = zod.string().min(5);

export type LoginPayload = zod.infer<typeof loginPayloadType>;
export const loginPayloadType = zod.object({
  username: zod.string(),
  password: zod.string(),
});

export type UserProfile = zod.infer<typeof userProfileType>;
export const userProfileType = zod.object({
  id: getZodType(LoginEntityType, "account_id"),
  username: getZodType(LoginEntityType, "userid"),
  email: getZodType(LoginEntityType, "email"),
  access: userAccessLevelType,
});

export type UserProfileMutation = zod.infer<typeof userProfileMutationType>;
export const userProfileMutationType = zod.object({
  email: emailType,
  password: passwordType.optional(),
  passwordConfirm: passwordType.optional(),
});

export type UserRegisterPayload = zod.infer<typeof userRegisterPayloadType>;
export const userRegisterPayloadType = zod.object({
  username: usernameType,
  email: emailType,
  password: passwordType,
  passwordConfirm: passwordType,
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
