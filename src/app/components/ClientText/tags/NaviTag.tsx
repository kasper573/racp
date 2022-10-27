import { useMemo } from "react";
import { ClientTextTag } from "../ClientTextTag";
import { Link, LinkBase } from "../../Link";
import { useNodeInfo } from "../useNodeInfo";
import { routes } from "../../../router";

export const NaviTag: ClientTextTag = ({ node }) => {
  const {
    info: [{ content: infoString }],
    content,
  } = useNodeInfo(node);
  const link = useMemo(
    () => parseLinkInfoString(infoString, content),
    [infoString, content]
  );
  return link ? (
    <Link to={link}>{content}</Link>
  ) : (
    <LinkBase href="#invalid-link-info">{content}</LinkBase>
  );
};

function parseLinkInfoString(infoString?: string, title?: string) {
  const values = infoString ? /^(\w+),(\d+),(\d+)/.exec(infoString) : undefined;
  if (values) {
    const [, id, x, y] = values;
    return routes.map.view({ id, pin: { x: +x, y: +y, title } });
  }
}
