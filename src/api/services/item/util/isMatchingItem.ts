import { Item, ItemFilter } from "../types";
import {
  isArrayMatch,
  isRangeMatch,
  isRefMatch,
  isStringMatch,
  isToggleMatch,
} from "../../../util/matchers";
import { clientTextContent } from "../../../common/clientTextType";

export function isMatchingItem(item: Item, filter: ItemFilter): boolean {
  const names = [
    item.Name,
    item.AegisName,
    item.AliasName,
    clientTextContent(item.Info?.identifiedDisplayName),
    clientTextContent(item.Info?.identifiedResourceName),
    clientTextContent(item.Info?.unidentifiedDisplayName),
    clientTextContent(item.Info?.unidentifiedResourceName),
  ];

  const descriptions = [
    clientTextContent(item.Info?.identifiedDescriptionName),
    clientTextContent(item.Info?.unidentifiedDescriptionName),
  ];

  const scripts = [
    item.Script?.raw,
    item.EquipScript?.raw,
    item.UnEquipScript?.raw,
  ];

  return (
    isRefMatch(filter.id, item.Id) &&
    names.some((name) => isStringMatch(filter.name, name)) &&
    descriptions.some((desc) => isStringMatch(filter.description, desc)) &&
    scripts.some((script) => isStringMatch(filter.script, script)) &&
    isArrayMatch(filter.types, item.Type) &&
    isArrayMatch(filter.subTypes, item.SubType) &&
    isToggleMatch(filter.classes, item.Classes) &&
    isToggleMatch(filter.jobs, item.Jobs) &&
    isArrayMatch(filter.elements, item.Script?.meta.elements) &&
    isArrayMatch(filter.statuses, item.Script?.meta.statuses) &&
    isArrayMatch(filter.races, item.Script?.meta.races) &&
    isRangeMatch(filter.slots, item.Slots)
  );
}
