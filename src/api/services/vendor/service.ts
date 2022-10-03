import * as zod from "zod";
import { t } from "../../trpc";
import { ItemRepository } from "../item/repository";
import { createSearchTypes } from "../../common/search";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { normalizeItemInstanceProperties } from "../inventory/types";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import {
  createVendorItemId,
  parseVendorItemId,
  VendorItem,
  vendorItemFilter,
  vendorItemType,
} from "./types";

export type VendorService = ReturnType<typeof createVendorService>;

const searchItemsTypes = createSearchTypes(
  vendorItemType,
  vendorItemFilter.type
);

export function createVendorService({
  db,
  items: itemRepo,
}: {
  db: DatabaseDriver;
  items: ItemRepository;
}) {
  return t.router({
    /**
     * Used from e2e test to populate the database with some data.
     * Has no use in production. Is locked behind admin access.
     */
    insertItems: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(
        zod.object({
          items: zod.array(vendorItemType),
          cartId: zod.number(),
          charId: zod.number(),
          accountId: zod.number(),
        })
      )
      .mutation(async ({ input: { items, cartId, charId, accountId } }) => {
        async function upsertItem(item: VendorItem) {
          const [vendorId, index] = parseVendorItemId(item.id);
          await Promise.all([
            db.map.table("vending_items").insert({
              vending_id: vendorId,
              index,
              cartinventory_id: cartId,
              amount: item.amount,
              price: item.price,
            }),
            db.map.table("vendings").insert({
              id: item.vendorId,
              account_id: accountId,
              char_id: charId,
              title: item.vendorTitle,
              map: item.map,
              x: item.x,
              y: item.y,
              autotrade: 0,
            }),
            db.map.table("cart_inventory").insert({
              id: cartId,
              char_id: charId,
              nameid: item.itemId,
              amount: item.amount,
              equip: 0,
              identify: item.identified ? 1 : 0,
              refine: item.refine,
              ...item.cardIds.reduce(
                (props, cardId, index) => ({
                  ...props,
                  [`card${index}`]: cardId,
                }),
                {}
              ),
              ...item.options.reduce(
                (props, option, index) => ({
                  ...props,
                  [`option_id${index}`]: option.id,
                  [`option_val${index}`]: option.value,
                }),
                {}
              ),
            }),
          ]);
        }
        await Promise.all(items.map(upsertItem));
      }),
    searchItems: t.procedure
      .input(searchItemsTypes.queryType)
      .output(searchItemsTypes.resultType)
      .query(async () => {
        const items = await itemRepo.getItems();

        // prettier-ignore
        const res = await db.map
          .table("vending_items")
          .join("cart_inventory", "cart_inventory.id", "vending_items.cartinventory_id")
          .join("vendings", "vendings.id", "vending_items.vending_id")
          .select("index", "price", "refine", "vendings.id as vendorId", "title as vendorTitle", "nameid as itemId", "vending_items.amount", "map", "x", "y", "card0", "card1", "card2", "card3", "option_id0", "option_id1", "option_id2", "option_id3", "option_val0", "option_val1", "option_val2", "option_val3");

        const entities = res.map((raw) => {
          const item = items.get(raw.itemId);
          return vendorItemType.parse({
            ...raw,
            id: createVendorItemId(raw.vendorId, raw.index),
            name: item ? item.Name : "Unknown item",
            imageUrl: item?.ImageUrl,
            slots: item?.Slots,
            ...normalizeItemInstanceProperties(raw),
          });
        });

        return { total: entities.length, entities };
      }),
  });
}
