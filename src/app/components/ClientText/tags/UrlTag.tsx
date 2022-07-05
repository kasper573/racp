import { ClientTextTag } from "../ClientTextTag";
import { LinkBase } from "../../Link";
import { useNodeInfo } from "../useNodeInfo";

export const UrlTag: ClientTextTag = ({ node }) => {
  const { info, content } = useNodeInfo(node);
  return (
    <LinkBase href={info[0]?.content ?? "#info-missing"} target="_blank">
      {content}
    </LinkBase>
  );
};
