import { t } from "../../trpc";
import { ItemRepository } from "../item/repository";
import { createSearchTypes } from "../../common/search";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { normalizeItemInstanceProperties } from "../inventory/types";
import {
  createVendorItemId,
  vendorItemFilterType,
  vendorItemType,
} from "./types";

export type VendorService = ReturnType<typeof createVendorService>;

export function createVendorService({
  db,
  items: itemRepo,
}: {
  db: DatabaseDriver;
  items: ItemRepository;
}) {
  const [input, output] = createSearchTypes(
    vendorItemType,
    vendorItemFilterType
  );
  return t.router({
    searchItems: t.procedure
      .input(input)
      .output(output)
      .query(async () => {
        const items = await itemRepo.getItems();

        const res = await db.map
          .table("vending_items")
          .join(
            "cart_inventory",
            "cart_inventory.id",
            "vending_items.cartinventory_id"
          )
          .join("vendings", "vendings.id", "vending_items.vending_id")
          .select(
            "index",
            "price",
            "refine",
            "vendings.id as vendorId",
            "title as vendorTitle",
            "nameid as itemId",
            "vending_items.amount",
            "map",
            "x",
            "y",
            "card0",
            "card1",
            "card2",
            "card3",
            "option_id0",
            "option_id1",
            "option_id2",
            "option_id3",
            "option_val0",
            "option_val1",
            "option_val2",
            "option_val3"
          );

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
