import { RAES } from "../raes";
import { createRpcHandlers } from "../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../lib/rpc/RpcException";
import { collectUnique } from "../../lib/collectUnique";
import { itemDefinition } from "./item.definition";
import { Item, itemType } from "./item.types";

export function createItemHandlers(raes: RAES) {
  const items = raes.resolve("db/item_db.yml", itemType, (entity) => entity.Id);
  const meta = collectItemMeta(Array.from(items.values()));

  return createRpcHandlers(itemDefinition.entries, {
    async getItemMeta() {
      return meta;
    },
    async searchItems() {
      return Array.from(items.values()).slice(0, 100);
    },
    async getItem(itemId) {
      const item = items.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
  });
}

function collectItemMeta(items: Item[]) {
  return {
    types: collectItemTypes(items),
    ...collectUnique(items, {
      genders: (item) => (item.Gender ? [item.Gender] : []),
      classes: (item) => Object.keys(item.Classes ?? {}),
      jobs: (item) => Object.keys(item.Jobs ?? {}),
      locations: (item) => Object.keys(item.Locations ?? {}),
    }),
  };
}

function collectItemTypes(items: Item[]) {
  const types: Record<string, string[]> = {};
  for (const item of items) {
    if (item.Type) {
      const subTypes: string[] = types[item.Type] || (types[item.Type] = []);
      if (item.SubType && !subTypes.includes(item.SubType)) {
        subTypes.push(item.SubType);
      }
    }
  }
  return types;
}
