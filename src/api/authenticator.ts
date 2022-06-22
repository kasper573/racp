import { compareSync, genSaltSync, hashSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import { Algorithm } from "jsonwebtoken";

export function createAuthenticator({
  secret,
  saltRounds = 8,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["HS256"],
}: AuthenticatorOptions) {
  const salt = genSaltSync(saltRounds);
  return {
    sign(id: string) {
      return jwt.sign({ id }, secret, { expiresIn: tokenLifetime });
    },
    compare(plain: string | Buffer, encrypted: string) {
      return compareSync(plain, encrypted);
    },
    encrypt(plain: string | Buffer) {
      return hashSync(plain, salt);
    },
    middleware: expressjwt({
      secret,
      algorithms,
      credentialsRequired: false,
    }),
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;
export interface AuthenticatorOptions {
  secret: string;
  saltRounds?: number;
  tokenLifetime?: number;
  algorithms?: Algorithm[];
}
