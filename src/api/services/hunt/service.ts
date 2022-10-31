import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../../trpc";
import { RACPDatabaseClient } from "../../common/createRACPDatabaseClient";
import {
  huntedItemType,
  huntedMonsterType,
  huntType,
} from "../../../../prisma/zod";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { AdminSettingsRepository } from "../settings/repository";
import { huntLimitsType, richHuntType } from "./types";

export type HuntService = ReturnType<typeof createHuntService>;

export function createHuntService({
  cpdb: db,
  settings,
}: {
  cpdb: RACPDatabaseClient;
  settings: AdminSettingsRepository;
}) {
  const limitsResource = settings.map(
    "huntLimits",
    (settings) => settings.huntLimits
  );
  return t.router({
    limits: t.procedure
      .output(huntLimitsType)
      .query(() => limitsResource.then()),
    list: t.procedure
      .output(zod.array(huntType))
      .use(access(UserAccessLevel.User))
      .query(({ ctx }) =>
        db.hunt.findMany({
          where: { accountId: ctx.auth.id },
        })
      ),
    richHunt: t.procedure
      .input(huntType.shape.id)
      .output(richHuntType)
      .use(access(UserAccessLevel.User))
      .query(async ({ input: huntId, ctx }) => {
        await assertHuntAccess(db, { accountId: ctx.auth.id, huntId });
        const hunt = await db.hunt.findFirst({
          where: { id: huntId },
          include: {
            monsters: true,
            items: true,
          },
        });
        if (!hunt) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return hunt;
      }),
    items: t.procedure
      .input(huntType.shape.id)
      .output(zod.array(huntedItemType))
      .use(access(UserAccessLevel.User))
      .query(async ({ input: huntId, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        return db.huntedItem.findMany({ where: { huntId } });
      }),
    monsters: t.procedure
      .input(huntType.shape.id)
      .output(zod.array(huntedMonsterType))
      .use(access(UserAccessLevel.User))
      .query(async ({ input: huntId, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        return db.huntedMonster.findMany({ where: { huntId } });
      }),
    create: t.procedure
      .input(zod.string())
      .output(huntType)
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: name, ctx }) => {
        const count = await db.hunt.count({
          where: { accountId: ctx.auth.id },
        });
        const limits = await limitsResource;
        if (count >= limits.hunts) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You cannot have more than ${limits.hunts} hunts.`,
          });
        }
        return db.hunt.create({
          data: { name, accountId: ctx.auth.id, editedAt: new Date() },
        });
      }),
    rename: t.procedure
      .input(zod.object({ id: huntType.shape.id, name: zod.string() }))
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { id: huntId, name }, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        await db.hunt.update({ data: { name }, where: { id: huntId } });
      }),
    delete: t.procedure
      .input(huntType.shape.id)
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: huntId, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        await db.hunt.delete({ where: { id: huntId } });
      }),
    addItem: t.procedure
      .input(huntedItemType.pick({ huntId: true, itemId: true }))
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { huntId, itemId }, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });

        const count = await db.huntedItem.count({ where: { huntId } });
        const limits = await limitsResource;
        if (count >= limits.itemsPerHunt) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You cannot have more than ${limits.itemsPerHunt} items per hunt.`,
          });
        }

        await db.huntedItem.create({
          data: {
            huntId,
            itemId,
            amount: 0,
            targetMonsterIds: "",
          },
        });
      }),
    updateItem: t.procedure
      .input(huntedItemType.omit({ huntId: true }).partial())
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { id, ...changes }, ctx }) => {
        const item = await db.huntedItem.findFirst({ where: { id } });
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await assertHuntAccess(db, {
          huntId: item.huntId,
          accountId: ctx.auth.id,
        });

        const count = changes.targetMonsterIds?.split(",").length ?? 0;
        const limits = await limitsResource;
        if (count >= limits.monstersPerItem) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You cannot have more than ${limits.monstersPerItem} monsters per item.`,
          });
        }

        await db.huntedItem.update({
          data: changes,
          where: { id },
        });
      }),
    removeItem: t.procedure
      .input(huntedItemType.pick({ huntId: true, itemId: true }))
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { huntId, itemId }, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        await db.huntedItem.deleteMany({ where: { huntId, itemId } });
      }),
    updateMonster: t.procedure
      .input(huntedMonsterType.omit({ huntId: true }).partial())
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { id, ...changes }, ctx }) => {
        const monster = await db.huntedMonster.findFirst({ where: { id } });
        if (!monster) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await assertHuntAccess(db, {
          huntId: monster.huntId,
          accountId: ctx.auth.id,
        });
        await db.huntedMonster.update({ data: changes, where: { id } });
      }),
  });
}

async function assertHuntAccess(
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

// function normalizeHunt(huntId: HuntId, state: HuntStore) {
//   const isMatch = <T extends { huntId: HuntId }>(o: T) => o.huntId === huntId;
//   const targetIds = uniq(
//     state.items
//       .filter(isMatch)
//       .map((i) => i.targets ?? [])
//       .flat()
//   );
//   const monsterIds = state.monsters.filter(isMatch).map((m) => m.monsterId);
//   const added = without(targetIds, ...monsterIds);
//   const removed = without(monsterIds, ...targetIds);
//   for (const id of added) {
//     state.monsters.push({ huntId, monsterId: id, killsPerUnit: 0 });
//   }
//   for (const id of removed) {
//     const index = state.monsters.findIndex(
//       (m) => isMatch(m) && m.monsterId === id
//     );
//     state.monsters.splice(index, 1);
//   }
// }

// function touchHunt(huntId: HuntId, state: HuntStore) {
//   const hunt = state.hunts.find((h) => h.id === huntId);
//   if (hunt) {
//     hunt.editedAt = Date.now();
//     state.hunts.sort((a, b) => b.editedAt - a.editedAt);
//   }
// }
