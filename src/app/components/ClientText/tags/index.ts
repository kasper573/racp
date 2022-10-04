/**
 * Defines what tags are available in ClientText.
 * Any missing tags will be rendered as normal text.
 * Key name must match the text name used in the client.
 */
import { ClientTextTag } from "../ClientTextTag";
import { ItemTag } from "./ItemTag";
import { InfoTag } from "./InfoTag";
import { NaviTag } from "./NaviTag";
import { UrlTag } from "./UrlTag";

const tagComponentLookup: Record<string, ClientTextTag> = {
  INFO: InfoTag,
  ITEM: ItemTag,
  NAVI: NaviTag,
  URL: UrlTag,
};

export default tagComponentLookup;
