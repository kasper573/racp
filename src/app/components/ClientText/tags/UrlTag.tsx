import { ClientTextTag } from "../ClientTextTag";
import { LinkBase } from "../../Link";

export const UrlTag: ClientTextTag = ({ children, node }) => {
  const info = node.children?.find((n) => n.tag === "INFO");
  const other = node.children?.filter((n) => n.tag !== "INFO");

  if (info?.content) {
    return (
      <LinkBase href={info?.content}>
        {node.content}
        {other?.map((o) => o.content).join("")}
      </LinkBase>
    );
  }

  return <>{children}</>;
};
