import { TRPCError } from "@trpc/server";
import { RACPDatabaseClient } from "../../../common/createRACPDatabaseClient";

export async function assertHuntAccess(
  db: RACPDatabaseClient,
  ids: {
    accountId: number;
    huntId: number;
  }
) {
  const res = await db.hunt.findFirst({
    select: null,
    where: { id: ids.huntId, accountId: ids.accountId },
  });
  if (res === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}
