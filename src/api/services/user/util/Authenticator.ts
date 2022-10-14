import * as jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import { Algorithm } from "jsonwebtoken";
import { UserAccessLevel } from "../types";

export function createAuthenticator({
  secret,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["HS256"],
}: AuthenticatorOptions) {
  const sign: AuthenticatorSigner = (payload) => {
    return jwt.sign(payload, secret, { expiresIn: tokenLifetime });
  };
  return {
    sign,
    middleware: expressjwt({
      secret,
      algorithms,
      credentialsRequired: false,
    }),
  };
}

export type AuthenticatorSigner = (payload: AuthenticatorPayload) => string;

export type Authenticator = ReturnType<typeof createAuthenticator>;

export interface AuthenticatorPayload {
  id: number;
  access: UserAccessLevel;
}

export interface AuthenticatorOptions {
  readonly secret: string;
  readonly tokenLifetime?: number;
  readonly algorithms?: Algorithm[];
}
