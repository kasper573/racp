import { Hunt } from "@prisma/client";
import { RACPDatabaseClient } from "../../../common/createRACPDatabaseClient";

export async function touchHunt(db: RACPDatabaseClient, huntId: Hunt["id"]) {
  await db.hunt.update({
    data: { editedAt: new Date() },
    where: { id: huntId },
  });
}
