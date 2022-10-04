import { ClientTextTag } from "../ClientTextTag";

// Afaik info tags are paired with item nodes to provide an item ID.
// However, we already know how to look up an item by name, so we can omit the info tags.
export const InfoTag: ClientTextTag = () => {
  return null;
};
