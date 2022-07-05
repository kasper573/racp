import { ClientTextTag } from "../ClientTextTag";
import { LinkBase } from "../../Link";
import { useNodeInfo } from "../useNodeInfo";

export const NaviTag: ClientTextTag = ({ node }) => {
  const { content } = useNodeInfo(node);
  return <LinkBase href="#not-implemented">{content}</LinkBase>;
};
