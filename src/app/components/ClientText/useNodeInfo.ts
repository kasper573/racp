import { useMemo } from "react";
import { ClientTextNode } from "../../../api/common/clientTextType";

export function useNodeInfo(node: ClientTextNode) {
  return useMemo(() => {
    const info = node.children?.filter((n) => n.tag === "INFO") ?? [];
    const other = node.children?.filter((n) => n.tag !== "INFO") ?? [];
    const content = [node.content, ...other.map((n) => n.content)]
      .filter(Boolean)
      .join("");
    return { info, content };
  }, [node]);
}
