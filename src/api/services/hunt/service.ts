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
import { HuntLimits, huntLimitsType, richHuntType } from "./types";

export type HuntService = ReturnType<typeof createHuntService>;

export function createHuntService(db: RACPDatabaseClient, limits: HuntLimits) {
  return t.router({
    limits: t.procedure.output(huntLimitsType).query(() => limits),
    hunts: t.procedure
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
        const hunt = await db.hunt.findFirst({ where: { id: huntId } });
        if (!hunt) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const items = await db.huntedItem.findMany({
          select: { itemId: true },
          where: { huntId },
        });
        const monsters = await db.huntedMonster.findMany({
          select: { monsterId: true },
          where: { huntId },
        });
        return {
          ...hunt,
          items: items.map((i) => i.itemId),
          monsters: monsters.map((m) => m.monsterId),
        };
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
    createHunt: t.procedure
      .input(zod.string())
      .output(huntType)
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: name, ctx }) => {
        const count = await db.hunt.count({
          where: { accountId: ctx.auth.id },
        });
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
    renameHunt: t.procedure
      .input(zod.object({ id: huntType.shape.id, name: zod.string() }))
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { id: huntId, name }, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        await db.hunt.update({ data: { name }, where: { id: huntId } });
      }),
    deleteHunt: t.procedure
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
