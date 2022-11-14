import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../../trpc";
import { RAthenaDatabaseDriver } from "../../rathena/RAthenaDatabaseDriver";
import { count, some } from "../../../lib/knex";
import { access } from "../../middlewares/access";
import { knexMatcher } from "../../matcher";
import { searchTypes } from "../../common/search.types";
import {
  loginPayloadType,
  UserAccessLevel,
  UserProfile,
  userProfileFilter,
  userProfileMutationType,
  userProfileType,
  userRegisterPayloadType,
} from "./types";
import { UserRepository } from "./repository";
import { AuthenticatorSigner } from "./util/Authenticator";

export type UserService = ReturnType<typeof createUserService>;

export function createUserService({
  radb,
  user: repo,
  sign,
}: {
  radb: RAthenaDatabaseDriver;
  user: UserRepository;
  sign: AuthenticatorSigner;
}) {
  return t.router({
    search: t.procedure
      .input(searchUsersTypes.queryType)
      .output(searchUsersTypes.resultType)
      .use(access(UserAccessLevel.Admin))
      .query(async ({ input }) => {
        const query = knexMatcher.search(createUserQuery(radb), input, {
          id: "account_id",
          username: "userid",
          email: "email",
        });

        const [users, total] = await Promise.all([query, count(query)]);
        const profiles = await usersToProfiles(repo, ...users);

        return {
          total,
          entities: profiles,
        };
      }),
    register: t.procedure
      .input(userRegisterPayloadType)
      .output(zod.boolean())
      .mutation(async ({ input: { username, password, email } }) => {
        if (
          await some(radb.login.table("login").where("userid", "=", username))
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }

        if (await some(radb.login.table("login").where("email", "=", email))) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already taken",
          });
        }

        const newAccountIds = await radb.login.table("login").insert({
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
        const user = await createUserQuery(radb)
          .where("userid", "=", username)
          .where("user_pass", "=", password)
          .first();

        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const [profile] = await usersToProfiles(repo, user);

        return {
          profile,
          token: sign({
            id: profile.id,
            access: profile.access,
          }),
        };
      }),
    updateMyProfile: t.procedure
      .input(userProfileMutationType)
      .output(zod.boolean())
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { email, password }, ctx: { auth } }) => {
        const emailOwner = await radb.login
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

        const affected = await radb.login
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

const searchUsersTypes = searchTypes(userProfileType, userProfileFilter.type);

function createUserQuery(radb: RAthenaDatabaseDriver) {
  return radb.login
    .table("login")
    .select("account_id", "userid", "group_id", "email");
}

function usersToProfiles(
  repo: UserRepository,
  ...users: Awaited<ReturnType<typeof createUserQuery>>
) {
  return Promise.all(
    users.map(
      async (user): Promise<UserProfile> => ({
        email: user.email,
        access: await repo.groupIdToUserLevel(user.group_id),
        id: user.account_id,
        username: user.userid,
      })
    )
  );
}
