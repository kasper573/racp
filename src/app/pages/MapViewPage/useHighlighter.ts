import { useCallback } from "react";

export function useHighlighter() {
  const setHighlightId = useCallback((id?: string) => {
    if (id) {
      document.body.setAttribute(idAttribute, id);
    } else {
      document.body.removeAttribute(idAttribute);
    }
  }, []);
  return setHighlightId;
}

export type HighlightId = string | string[];
export const createHighlightSelector = (idOrIds: HighlightId) => {
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  return ids.map((id) => `${idSelector(id)} &`).join(", ");
};

const idAttribute = "data-highlight-id";
const idSelector = (id: string) => `[${idAttribute}="${id}"]`;
