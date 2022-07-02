import { Authenticator } from "../util/authenticator";

export function usersFixture(auth: Authenticator, adminPassword?: string) {
  return adminPassword
    ? [
        {
          id: "admin",
          username: "admin",
          passwordHash: auth.encrypt(adminPassword),
        },
      ]
    : [];
}
