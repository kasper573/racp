import { Item, ItemFilter, ItemInfo } from "../types";
import {
  isArrayMatch,
  isRangeMatch,
  isRefMatch,
  isStringMatch,
  isToggleMatch,
} from "../../../util/matchers";
import { clientTextToString } from "../../../common/clientTextType";

export function isMatchingItem(item: Item, filter: ItemFilter): boolean {
  return (
    isRefMatch(filter.id, item.Id) &&
    (isStringMatch(filter.name, item.Name) ||
      isStringMatch(filter.name, item.AegisName) ||
      isStringMatch(filter.name, item.AliasName)) &&
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
  return info.identifiedDescriptionName
    .map(clientTextToString)
    .join("\n")
    .toLowerCase()
    .includes(description.toLowerCase());
}
