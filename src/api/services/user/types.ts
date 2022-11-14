import * as zod from "zod";
import { getZodType } from "../../../lib/zod/zodPath";
import { LoginEntityType } from "../../rathena/DatabaseDriver.types";
import { createPropertyMatchRefiner } from "../../../lib/zod/propertyMatchRefiner";
import { toggleRecordType } from "../../../lib/zod/zodToggle";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../matcher";
import { createSearchTypes } from "../../common/search.types";

export enum UserAccessLevel {
  Guest,
  User,
  Admin,
}

export const userAccessLevelType = zod.nativeEnum(UserAccessLevel);
export const usernameType = zod.string().min(6).max(12);
export const emailType = zod.string().email();
export const passwordType = zod.string().min(6);

export type LoginPayload = zod.infer<typeof loginPayloadType>;
export const loginPayloadType = zod.object({
  username: zod.string(),
  password: zod.string(),
});

export type AccountId = zod.infer<typeof accountIdType>;
export const accountIdType = getZodType(LoginEntityType, "account_id");

export type UserProfile = zod.infer<typeof userProfileType>;
export const userProfileType = zod.object({
  id: accountIdType,
  username: getZodType(LoginEntityType, "userid"),
  email: getZodType(LoginEntityType, "email"),
  access: userAccessLevelType,
});

const passwordMatcher = createPropertyMatchRefiner(
  "password",
  "passwordConfirm",
  "Passwords do not match"
);

export type UserProfileMutation = zod.infer<typeof userProfileMutationType>;
export const userProfileMutationType = zod
  .object({
    email: emailType,
    password: passwordType.optional(),
    passwordConfirm: passwordType.optional(),
  })
  .refine(...passwordMatcher);

export type UserRegisterPayload = zod.infer<typeof userRegisterPayloadType>;
export const userRegisterPayloadType = zod
  .object({
    username: usernameType,
    email: emailType,
    password: passwordType,
    passwordConfirm: passwordType,
  })
  .refine(...passwordMatcher);

export const userGroupType = zod.object({
  Id: zod.number(),
  Name: zod.string().default(""),
  Level: zod.number().default(0),
  LogCommands: zod.boolean().default(false),
  Commands: toggleRecordType,
  CharCommands: toggleRecordType,
  Permissions: toggleRecordType,
  Inherit: toggleRecordType,
});

export type UserProfileFilter = zod.infer<typeof userProfileFilter.type>;
export const userProfileFilter = createEntityFilter(matcher, userProfileType);

export const searchUsersTypes = createSearchTypes(
  userProfileType,
  userProfileFilter.type
);
