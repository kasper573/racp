import * as jwt from "jsonwebtoken";
import { expressjwt, Request as JWTRequest } from "express-jwt";
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

export function createAccessValidator(requiredAccess: UserAccessLevel) {
  return (req: JWTRequest<AuthenticatorTokenPayload>) =>
    (req.auth?.access ?? 0) >= requiredAccess;
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
