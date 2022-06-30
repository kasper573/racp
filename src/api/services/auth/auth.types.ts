import * as zod from "zod";

export type InternalUser = zod.infer<typeof internalUserType>;

export const internalUserType = zod.object({
  id: zod.string(),
  username: zod.string(),
  passwordHash: zod.string(),
});

export type PublicUser = zod.infer<typeof publicUserType>;

export const publicUserType = internalUserType.omit({ passwordHash: true });
