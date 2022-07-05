/**
 * Defines what tags are available in ClientText.
 * Any missing tags will be rendered as normal text.
 * Key name must match the text name used in the client.
 */
import { ClientTextTag } from "../ClientTextTag";
import { InfoTag } from "./InfoTag";
import { ItemTag } from "./ItemTag";
import { NaviTag } from "./NaviTag";
import { TipboxTag } from "./TipboxTag";
import { UrlTag } from "./UrlTag";

const tagComponentLookup: Record<string, ClientTextTag> = {
  INFO: InfoTag,
  ITEM: ItemTag,
  NAVI: NaviTag,
  TIPBOX: TipboxTag,
  URL: UrlTag,
};

export default tagComponentLookup;
