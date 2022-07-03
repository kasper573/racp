import * as jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import { Algorithm } from "jsonwebtoken";
import { UserAccessLevel } from "./UserAccessLevel";

export function createAuthenticator({
  secret,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["HS256"],
}: AuthenticatorOptions) {
  return {
    sign(payload: AuthenticatorTokenPayload) {
      return jwt.sign(payload, secret, { expiresIn: tokenLifetime });
    },
    middleware: expressjwt({
      secret,
      algorithms,
      credentialsRequired: false,
    }),
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;

export interface AuthenticatorTokenPayload {
  id: number;
  access: UserAccessLevel;
}

export interface AuthenticatorOptions {
  readonly secret: string;
  readonly tokenLifetime?: number;
  readonly algorithms?: Algorithm[];
}
