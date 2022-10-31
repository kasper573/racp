import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../../trpc";
import { RAthenaDatabaseDriver } from "../../rathena/RAthenaDatabaseDriver";
import { some } from "../../../lib/knex";
import { access } from "../../middlewares/access";
import {
  loginPayloadType,
  UserAccessLevel,
  userProfileMutationType,
  userProfileType,
  userRegisterPayloadType,
} from "./types";
import { UserRepository } from "./repository";
import { AuthenticatorSigner } from "./util/Authenticator";

export type UserService = ReturnType<typeof createUserService>;

export function createUserService({
  db,
  user: repo,
  sign,
}: {
  db: RAthenaDatabaseDriver;
  user: UserRepository;
  sign: AuthenticatorSigner;
}) {
  return t.router({
    register: t.procedure
      .input(userRegisterPayloadType)
      .output(zod.boolean())
      .mutation(async ({ input: { username, password, email } }) => {
        if (
          await some(db.login.table("login").where("userid", "=", username))
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }

        if (await some(db.login.table("login").where("email", "=", email))) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already taken",
          });
        }

        const newAccountIds = await db.login.table("login").insert({
          email,
          userid: username,
          user_pass: password,
        });

        return newAccountIds.length > 0;
      }),
    login: t.procedure
      .input(loginPayloadType)
      .output(zod.object({ token: zod.string(), profile: userProfileType }))
      .mutation(async ({ input: { username, password } }) => {
        const user = await db.login
          .table("login")
          .select("account_id", "userid", "group_id", "email")
          .where("userid", "=", username)
          .where("user_pass", "=", password)
          .first();

        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const id = user.account_id;
        const ids = await repo.adminGroupIds;
        const access = ids.includes(user.group_id)
          ? UserAccessLevel.Admin
          : UserAccessLevel.User;

        return {
          token: sign({ id, access }),
          profile: {
            id,
            username: user.userid,
            email: user.email,
            access,
          },
        };
      }),
    updateMyProfile: t.procedure
      .input(userProfileMutationType)
      .output(zod.boolean())
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { email, password }, ctx: { auth } }) => {
        const emailOwner = await db.login
          .table("login")
          .select("account_id")
          .where("email", "=", email)
          .first();

        if (emailOwner && emailOwner?.account_id !== auth.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already taken",
          });
        }

        const affected = await db.login
          .table("login")
          .update({
            email,
            user_pass: password,
          })
          .where("account_id", "=", auth.id);

        return affected > 0;
      }),
  });
}
