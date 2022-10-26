import { ReactElement } from "react";
import { TSRBuilder } from "../lib/tsr/tsr";

const defaultOptions = {
  title: "",
  icon: <></>,
};

export const t = new TSRBuilder()
  .meta<typeof defaultOptions>()
  .renderResult<ReactElement | null>()
  .build({
    path: "" as const,
    params: {},
    meta: defaultOptions,
    renderer: ({ children }) => <>{children}</>,
    children: {},
    middlewares: [],
  });
