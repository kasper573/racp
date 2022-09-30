import * as zod from "zod";
import { createYamlResolver } from "../../../rathena/YamlDriver";
import { Item, itemPostProcessType, itemType } from "../types";
import { defined } from "../../../../lib/std/defined";
import { clientTextContent } from "../../../common/clientTextType";
import { typedAssign } from "../../../../lib/std/typedAssign";

export interface ItemResolverProps {
  tradeScale: number;
}

export function createItemResolver({ tradeScale }: ItemResolverProps) {
  return createYamlResolver(itemType, {
    getKey: (o) => o.Id,
    postProcess(item) {
      typedAssign(item, collect(item, tradeScale));
    },
  });
}

function collect(
  item: Item,
  tradeScale: number
): zod.infer<typeof itemPostProcessType> {
  const Buy = item.Buy ?? (item.Sell ?? 0) * tradeScale;
  const Sell = item.Sell ?? (item.Buy ?? 0) / tradeScale;
  return {
    Buy,
    Sell,

    Elements: item.Script?.meta.elements ?? [],
    Statuses: item.Script?.meta.statuses ?? [],
    Races: item.Script?.meta.races ?? [],

    NameList: defined([
      item.Name,
      item.AegisName,
      item.AliasName,
      clientTextContent(item.Info?.identifiedDisplayName),
      clientTextContent(item.Info?.unidentifiedDisplayName),
    ]),

    DescriptionList: defined([
      clientTextContent(item.Info?.identifiedDescriptionName),
      clientTextContent(item.Info?.unidentifiedDescriptionName),
    ]),

    ScriptList: defined([
      item.Script?.raw,
      item.EquipScript?.raw,
      item.UnEquipScript?.raw,
    ]),
  };
}
