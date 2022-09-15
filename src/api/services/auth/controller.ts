import { createRpcController } from "../../util/rpc";
import { RpcException } from "../../../lib/rpc/RpcException";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { some } from "../../util/knex";
import { AuthenticatorSigner } from "./util/Authenticator";
import { authDefinition } from "./definition";
import { UserAccessLevel } from "./types";
import { AuthRepository } from "./repository";

export async function authController({
  db,
  auth,
  sign,
}: {
  db: DatabaseDriver;
  auth: AuthRepository;
  sign: AuthenticatorSigner;
}) {
  return createRpcController(authDefinition.entries, {
    async register({ username, password, email }) {
      if (await some(db.login.table("login").where("userid", "=", username))) {
        throw new RpcException("Username already taken");
      }

      if (await some(db.login.table("login").where("email", "=", email))) {
        throw new RpcException("Email already taken");
      }

      const newAccountIds = await db.login.table("login").insert({
        email,
        userid: username,
        user_pass: password,
      });

      return newAccountIds.length > 0;
    },
    async login({ username, password }) {
      const user = await db.login
        .table("login")
        .select("account_id", "userid", "group_id", "email")
        .where("userid", "=", username)
        .where("user_pass", "=", password)
        .first();

      if (!user) {
        throw new RpcException("Invalid credentials");
      }

      const id = user.account_id;
      const ids = await auth.adminGroupIds;
      const access = ids.includes(user.group_id)
        ? UserAccessLevel.Admin
        : UserAccessLevel.User;

      return sign({ id, access });
    },
    async getMyProfile(_, { auth }) {
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
    },
    async updateMyProfile({ email, password }, { auth }) {
      if (!auth) {
        throw new RpcException("Must be signed in");
      }

      const emailOwner = await db.login
        .table("login")
        .select("account_id")
        .where("email", "=", email)
        .first();

      if (emailOwner?.account_id !== auth.id) {
        throw new RpcException("Email already taken");
      }

      const affected = await db.login
        .table("login")
        .update({
          email,
          user_pass: password,
        })
        .where("account_id", "=", auth.id);

      return affected > 0;
    },
  });
}

export async function createUser(
  db: DatabaseDriver,
  user: {
    username: string;
    password: string;
    email: string;
    group: UserAccessLevel;
  }
) {
  await db.login.table("login").insert({
    userid: user.username,
    user_pass: user.password,
    email: user.email,
    group_id: user.group,
  });
}
