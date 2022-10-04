import { ClientTextTag } from "../ClientTextTag";
import { useNodeInfo } from "../useNodeInfo";
import { trpc } from "../../../state/client";
import { ItemIdentifier } from "../../ItemIdentifier";

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
  const item = data?.entities[0];
  if (item !== undefined) {
    return <ItemIdentifier item={item} />;
  }

  // Unknown item, cannot link
  return <>{content}</>;
};
