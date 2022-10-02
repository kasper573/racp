import * as zod from "zod";
import { itemIdType } from "../item/types";
import { itemInstancePropertiesType } from "../inventory/types";

export type VendorItem = zod.infer<typeof vendorItemType>;

export const vendorItemType = zod.object({
  id: zod.string(),
  itemId: itemIdType,
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

export const vendorItemFilterType = vendorItemType.partial();
