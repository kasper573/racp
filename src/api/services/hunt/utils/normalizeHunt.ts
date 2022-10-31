import { Hunt } from "@prisma/client";
import { RACPDatabaseClient } from "../../../common/createRACPDatabaseClient";

/**
 * Makes sure there's always exactly one HuntedMonster instance for each unique HuntedItem["targets"]
 */
export async function normalizeHunt(
  db: RACPDatabaseClient,
  huntId: Hunt["id"]
) {
  const huntTargetIds = (
    await db.huntedItem.findMany({
      where: { huntId },
      select: { targetMonsterIds: true },
    })
  )
    .map((o) =>
      o.targetMonsterIds
        .split(",")
        .filter((s) => s !== "")
        .map(parseFloat)
    )
    .flat();

  const huntedMonsters = await db.huntedMonster.findMany({
    where: { huntId },
    select: { id: true, monsterId: true },
  });

  const newMonsterIds = huntTargetIds.filter(
    (id) => !huntedMonsters.some((m) => m.monsterId === id)
  );
  const removedMonsterIds = huntedMonsters.filter(
    (m) => !huntTargetIds.includes(m.monsterId)
  );

  if (removedMonsterIds.length) {
    await db.huntedMonster.deleteMany({
      where: { id: { in: removedMonsterIds.map((m) => m.id) } },
    });
  }
  if (newMonsterIds.length) {
    await Promise.all(
      newMonsterIds.map((id) =>
        db.huntedMonster.create({
          data: { huntId, monsterId: id, killsPerUnit: 0 },
        })
      )
    );
  }
}
