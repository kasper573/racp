import { t } from "../../trpc";
import { vendorItemQueryType, vendorItemResultType } from "./types";

export type VendorService = ReturnType<typeof createVendorService>;

export function createVendorService() {
  return t.router({
    search: t.procedure
      .input(vendorItemQueryType)
      .output(vendorItemResultType)
      .query(() => {
        return { total: 1, entities: [{ id: 5 }] };
      }),
  });
}
