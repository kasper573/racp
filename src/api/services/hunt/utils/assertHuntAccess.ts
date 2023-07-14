import { TRPCError } from "@trpc/server";
import { Hunt } from "@prisma/client";
import { RACPDatabaseClient } from "../../../common/createRACPDatabaseClient";
import { AuthenticatorPayload } from "../../user/util/Authenticator";
import { UserAccessLevel } from "../../user/types";

export async function assertHuntAccess(
  db: RACPDatabaseClient,
  {
    huntId,
    auth,
  }: {
    huntId: Hunt["id"];
    auth?: AuthenticatorPayload;
  }
) {
  if (auth && auth.access >= UserAccessLevel.Admin) {
    return; // admins can access any list
  }

  const res = auth
    ? await db.hunt.findFirst({
        select: null,
        where: { id: huntId, accountId: auth.id },
      })
    : null;

  if (res === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}
