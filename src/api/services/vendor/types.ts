import * as zod from "zod";
import { createSearchTypes } from "../../common/search";

export type VendorItem = zod.infer<typeof vendorItemType>;

export const vendorItemType = zod.object({
  id: zod.number(),
});

export const vendorItemFilterType = vendorItemType.partial();

export const [vendorItemQueryType, vendorItemResultType] = createSearchTypes(
  vendorItemType,
  vendorItemFilterType
);
