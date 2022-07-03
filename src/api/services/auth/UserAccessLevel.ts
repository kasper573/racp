import * as zod from "zod";

export enum UserAccessLevel {
  Guest,
  User,
  Admin,
}

export const userAccessLevelType = zod.nativeEnum(UserAccessLevel);
