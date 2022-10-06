import { DatabaseDriver } from "../../../rathena/DatabaseDriver";
import { Mvp, MvpStatus } from "../types";
import { determineMvpLifeStatus } from "./determineMvpLifeStatus";

export async function queryMvpStatus(
  db: DatabaseDriver,
  boss: Mvp
): Promise<MvpStatus> {
  const logEntry = await db.log
    .table("mvplog")
    .select("*")
    .orderBy("mvp_date", "desc")
    .where({ monster_id: boss.monsterId, map: boss.mapId })
    .first();

  const killedAt = logEntry?.mvp_date.getTime();
  const lifeStatus = determineMvpLifeStatus(Date.now(), { ...boss, killedAt });
  if (lifeStatus === "Alive") {
    return { lifeStatus };
  }

  const killedBy = logEntry
    ? (
        await db.char
          .table("char")
          .select("name")
          .where({ char_id: logEntry.kill_char_id })
          .first()
      )?.name
    : undefined;

  return {
    lifeStatus,
    killedAt,
    killedBy,
  };
}
