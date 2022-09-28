import { ClientTextTag } from "../ClientTextTag";
import { Link } from "../../Link";
import { router } from "../../../router";
import { useNodeInfo } from "../useNodeInfo";
import { trpc } from "../../../state/client";

export const ItemTag: ClientTextTag = ({ node }) => {
  const { content } = useNodeInfo(node);

  // Assume tag content is an item name
  const { data } = trpc.item.search.useQuery(
    {
      filter: {
        NameList: {
          value: content,
          matcher: "someItemEquals",
          options: { caseSensitive: false },
        },
      },
      limit: 1,
    },
    { enabled: !!content }
  );

  // Link to item if one was found
  const id = data?.entities[0]?.Id;
  if (id !== undefined) {
    return <Link to={router.item().view({ id })}>{content}</Link>;
  }

  // Unknown item, cannot link
  return <>{content}</>;
};
