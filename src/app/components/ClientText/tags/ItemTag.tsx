import { ClientTextTag } from "../ClientTextTag";
import { useNodeInfo } from "../useNodeInfo";
import { ItemIdentifierByName } from "../../ItemIdentifier";

export const ItemTag: ClientTextTag = ({ node }) => {
  const { content } = useNodeInfo(node);
  return <ItemIdentifierByName name={content} />;
};
