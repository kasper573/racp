import * as jwt from "jsonwebtoken";
import { expressjwt, Request as JWTRequest } from "express-jwt";
import { Algorithm } from "jsonwebtoken";
import { UserAccessLevel } from "./types";

export function createAuthenticator({
  secret,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["HS256"],
}: AuthenticatorOptions) {
  type Payload = {
    id: number;
    access: UserAccessLevel;
  };
  return {
    sign(payload: Payload) {
      return jwt.sign(payload, secret, { expiresIn: tokenLifetime });
    },
    middleware: expressjwt({
      secret,
      algorithms,
      credentialsRequired: false,
    }),
    validatorFor(requiredAccess: UserAccessLevel) {
      return (req: JWTRequest<Payload>) =>
        (req.auth?.access ?? 0) >= requiredAccess;
    },
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;

export interface AuthenticatorOptions {
  readonly secret: string;
  readonly tokenLifetime?: number;
  readonly algorithms?: Algorithm[];
}
