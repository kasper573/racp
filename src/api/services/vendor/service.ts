import * as zod from "zod";
import { t } from "../../trpc";
import { ItemRepository } from "../item/repository";
import { createSearchTypes } from "../../common/search";
import { RAthenaDatabaseDriver } from "../../rathena/RAthenaDatabaseDriver";
import { normalizeItemInstanceProperties } from "../inventory/types";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { count } from "../../../lib/knex";
import { itemFilter } from "../item/types";
import { knexMatcher } from "../../matcher";
import {
  createVendorItemId,
  parseVendorItemId,
  VendorItem,
  vendorItemFilter,
  vendorItemType,
} from "./types";

export type VendorService = ReturnType<typeof createVendorService>;

export function createVendorService({
  radb,
  items: itemRepo,
}: {
  radb: RAthenaDatabaseDriver;
  items: ItemRepository;
}) {
  return t.router({
    /**
     * Used from e2e test to prepare fixtures. Is locked behind admin access.
     */
    insertItems: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(
        zod.object({
          items: zod.array(vendorItemType),
          charId: zod.number(),
          accountId: zod.number(),
        })
      )
      .mutation(async ({ input: { items, accountId, charId } }) => {
        async function insertItem(item: VendorItem) {
          const [vendorId, index] = parseVendorItemId(item.id);
          const [cartId] = await radb.map.table("cart_inventory").insert({
            char_id: charId,
            nameid: item.itemId,
            amount: item.amount,
            equip: 0,
            refine: item.refine,
            ...item.cardIds.slice(0, 4).reduce(
              (props, cardId, index) => ({
                ...props,
                [`card${index}`]: cardId,
              }),
              {}
            ),
            ...item.options.slice(0, 4).reduce(
              (props, option, index) => ({
                ...props,
                [`option_id${index}`]: option.id,
                [`option_val${index}`]: option.value,
              }),
              {}
            ),
          });
          await Promise.all([
            radb.map.table("vending_items").insert({
              vending_id: vendorId,
              index,
              cartinventory_id: cartId,
              amount: item.amount,
              price: item.price,
            }),
            radb.map.table("vendings").insert({
              id: item.vendorId,
              account_id: accountId,
              char_id: charId,
              title: item.vendorTitle,
              map: item.map,
              x: item.x,
              y: item.y,
              autotrade: 0,
            }),
          ]);
        }
        await Promise.all(items.map(insertItem));
      }),
    searchItems: t.procedure
      .input(searchItemsTypes.queryType)
      .output(searchItemsTypes.resultType)
      .query(async ({ input }) => {
        const items = await itemRepo.items;

        // prettier-ignore
        let query = radb.map
          .table("vending_items")
          .join("cart_inventory", "cart_inventory.id", "vending_items.cartinventory_id")
          .join("vendings", "vendings.id", "vending_items.vending_id")
          .select("index", "price", "refine", "vendings.id as vendorId", "title as vendorTitle", "nameid as itemId", "vending_items.amount", "map", "x", "y", "card0", "card1", "card2", "card3", "option_id0", "option_id1", "option_id2", "option_id3", "option_val0", "option_val1", "option_val2", "option_val3")

        // Manual join since sql database doesn't contain item names
        if (input.filter?.name) {
          const idsForGivenNameFilter = Array.from(items.values())
            .filter(itemFilter.for({ Name: input.filter.name }))
            .map((item) => item.Id);
          delete input.filter["name"];
          query = query.whereIn("nameid", idsForGivenNameFilter);
        }

        query = knexMatcher.search(query, input, {
          itemId: "nameid",
          vendorTitle: "title",
          price: "price",
          amount: "vending_items.amount",
        });

        const [result, total] = await Promise.all([query, count(query)]);

        return {
          total,
          entities: result.map((raw: any) => {
            const item = items.get(raw.itemId);
            return vendorItemType.parse({
              ...raw,
              id: createVendorItemId(raw.vendorId, raw.index),
              name: item ? item.Name : "Unknown item",
              imageUrl: item?.ImageUrl,
              slots: item?.Slots,
              ...normalizeItemInstanceProperties(raw),
            });
          }),
        };
      }),
  });
}

const searchItemsTypes = createSearchTypes(
  vendorItemType,
  vendorItemFilter.type
);
