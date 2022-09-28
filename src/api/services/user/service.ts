import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../t";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { some } from "../../util/knex";
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
  db: DatabaseDriver;
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
      .output(zod.string())
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

        return sign({ id, access });
      }),
    getMyProfile: t.procedure
      .output(userProfileType.optional())
      .mutation(async ({ ctx: { auth } }) => {
        if (!auth) {
          return undefined;
        }
        const user = await db.login
          .table("login")
          .select("userid", "group_id", "email")
          .where("account_id", "=", auth.id)
          .first();
        if (!user) {
          return undefined;
        }
        return {
          id: auth.id,
          username: user.userid,
          email: user.email,
          access: auth.access,
        };
      }),
    updateMyProfile: t.procedure
      .input(userProfileMutationType)
      .output(zod.boolean())
      .mutation(async ({ input: { email, password }, ctx: { auth } }) => {
        if (!auth) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const emailOwner = await db.login
          .table("login")
          .select("account_id")
          .where("email", "=", email)
          .first();

        if (emailOwner?.account_id !== auth.id) {
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
