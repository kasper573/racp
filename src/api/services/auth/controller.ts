import { createRpcController } from "../../util/rpc";
import { RpcException } from "../../../lib/rpc/RpcException";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { isEmail } from "../../validators/isEmail";
import { isPassword } from "../../validators/isPassword";
import { LoginEntity } from "../../rathena/DatabaseDriver.types";
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
    async register({ username, password }) {
      return false;
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

      return {
        token: sign({ id, access }),
        access,
      };
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
    async updateMyProfile(mutation, { auth }) {
      if (!auth) {
        throw new RpcException("Must be signed in");
      }

      const changes: Partial<LoginEntity> = {
        email: mutation.email,
        user_pass: mutation.password,
      };

      if (mutation.password || mutation.passwordConfirm) {
        const passwordError = isPassword(
          mutation.password,
          mutation.passwordConfirm
        );
        if (passwordError) {
          throw new RpcException(passwordError);
        }
      } else {
        delete changes.user_pass;
      }

      if (!isEmail(mutation.email)) {
        throw new RpcException("Invalid email");
      }

      const affected = await db.login
        .table("login")
        .update(changes)
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
