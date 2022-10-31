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
import { richHuntType } from "./types";
import { normalizeHunt } from "./utils/normalizeHunt";
import { touchHunt } from "./utils/touchHunt";
import { assertHuntAccess } from "./utils/assertHuntAccess";

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
    list: t.procedure
      .output(zod.array(huntType))
      .use(access(UserAccessLevel.User))
      .query(({ ctx }) =>
        db.hunt.findMany({
          where: { accountId: ctx.auth.id },
          orderBy: { editedAt: "desc" },
        })
      ),
    read: t.procedure
      .input(huntType.shape.id)
      .output(richHuntType)
      .query(async ({ input: huntId }) => {
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
    copy: t.procedure
      .input(huntType.shape.id)
      .output(huntType)
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: huntId, ctx }) => {
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
        const huntCopy = await db.hunt.create({
          data: {
            name: `${hunt.name} (copy)`,
            accountId: ctx.auth.id,
            items: {
              create: hunt.items.map(
                ({ itemId, targetMonsterIds, amount }) => ({
                  itemId,
                  targetMonsterIds,
                  amount,
                })
              ),
            },
          },
        });
        await normalizeHunt(db, huntCopy.id);
        return huntCopy;
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
        await touchHunt(db, huntId);
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
        if (count > limits.monstersPerItem) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You cannot have more than ${limits.monstersPerItem} monsters per item.`,
          });
        }

        await db.huntedItem.update({
          data: changes,
          where: { id },
        });
        await normalizeHunt(db, item.huntId);
        await touchHunt(db, item.huntId);
      }),
    removeItem: t.procedure
      .input(huntedItemType.pick({ huntId: true, itemId: true }))
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { huntId, itemId }, ctx }) => {
        await assertHuntAccess(db, { huntId, accountId: ctx.auth.id });
        await db.huntedItem.deleteMany({ where: { huntId, itemId } });
        await normalizeHunt(db, huntId);
        await touchHunt(db, huntId);
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
        await touchHunt(db, monster.huntId);
      }),
  });
}
