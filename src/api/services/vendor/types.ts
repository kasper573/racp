import * as zod from "zod";
import { itemIdType } from "../item/types";
import { itemInstancePropertiesType } from "../inventory/types";

export type VendorItem = zod.infer<typeof vendorItemType>;

export const vendorItemType = zod.object({
  id: zod.string(),
  itemId: itemIdType,
  slots: zod.number().optional(),
  name: zod.string(),
  price: zod.number(),
  amount: zod.number(),
  imageUrl: zod.string().optional(),
  vendorId: zod.number(),
  vendorTitle: zod.string(),
  map: zod.string(),
  x: zod.number(),
  y: zod.number(),
  ...itemInstancePropertiesType.shape,
});

export const createVendorItemId = (vendorId: number, cartIndex: number) =>
  `${vendorId}_${cartIndex}`;

export const parseVendorItemId = (str: string) => {
  const numbers = str.split("_").map((x) => parseInt(x));
  if (numbers.length !== 2) {
    throw new Error("Invalid vendor item id");
  }
  const [vendorId, cartIndex] = numbers;
  return [vendorId, cartIndex] as const;
};

export const vendorItemFilterType = vendorItemType.partial();
