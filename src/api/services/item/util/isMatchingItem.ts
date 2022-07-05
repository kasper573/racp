import { Item, ItemFilter, ItemInfo } from "../types";
import {
  isArrayMatch,
  isRangeMatch,
  isRefMatch,
  isStringMatch,
  isToggleMatch,
} from "../../../util/matchers";
import { findNode } from "../../../../lib/graph";
import { clientTextContent } from "../../../common/clientTextType";

export function isMatchingItem(item: Item, filter: ItemFilter): boolean {
  const names: Array<string | undefined> = [
    item.Name,
    item.AegisName,
    item.AliasName,
    clientTextContent(item.Info?.identifiedDisplayName),
    clientTextContent(item.Info?.identifiedResourceName),
    clientTextContent(item.Info?.unidentifiedDisplayName),
    clientTextContent(item.Info?.unidentifiedResourceName),
  ];

  return (
    isRefMatch(filter.id, item.Id) &&
    names.some((name) => isStringMatch(filter.name, name)) &&
    isMatchingDescription(filter.description, item.Info) &&
    isArrayMatch(filter.types, item.Type) &&
    isArrayMatch(filter.subTypes, item.SubType) &&
    isToggleMatch(filter.classes, item.Classes) &&
    isToggleMatch(filter.jobs, item.Jobs) &&
    isArrayMatch(filter.elements, item.Script?.meta.elements) &&
    isArrayMatch(filter.statuses, item.Script?.meta.statuses) &&
    isArrayMatch(filter.races, item.Script?.meta.races) &&
    isRangeMatch(filter.slots, item.Slots) &&
    (isStringMatch(filter.script, item.Script?.raw) ||
      isStringMatch(filter.script, item.EquipScript?.raw) ||
      isStringMatch(filter.script, item.UnEquipScript?.raw))
  );
}

function isMatchingDescription(description?: string, info?: ItemInfo) {
  if (!description) {
    return true;
  }
  if (!info) {
    return false;
  }
  const lcDesc = description.toLowerCase();
  return !!info.identifiedDescriptionName.find((text) =>
    findNode(text, (node) => node.content?.toLowerCase().includes(lcDesc))
  );
}
