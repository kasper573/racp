import { ClientTextTag } from "../ClientTextTag";
import { Link } from "../../Link";
import { router } from "../../../router";
import { useNodeInfo } from "../useNodeInfo";
import { useSearchItemsQuery } from "../../../state/client";

export const ItemTag: ClientTextTag = ({ node }) => {
  const { info, content } = useNodeInfo(node);

  // Assume tag content is an item name
  const name = info[0]?.content;
  const { data } = useSearchItemsQuery(
    { filter: { name }, limit: 1 },
    { skip: !name }
  );

  // Link to item if one was found
  const id = data?.entities[0]?.Id;
  if (id !== undefined) {
    return <Link to={router.item().view({ id })}>{content}</Link>;
  }

  // Unknown item, cannot link
  return <>{content}</>;
};
