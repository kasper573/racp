import { createRAYamlResolver } from "../../../../lib/rathena/RAYamlDriver";
import { itemType } from "../types";

export interface ItemResolverProps {
  tradeScale: number;
}

export function createItemResolver({ tradeScale }: ItemResolverProps) {
  return createRAYamlResolver(itemType, {
    getKey: (o) => o.Id,
    postProcess(item) {
      item.Buy = item.Buy ?? (item.Sell ?? 0) * tradeScale;
      item.Sell = item.Sell ?? (item.Buy ?? 0) / tradeScale;
    },
  });
}
