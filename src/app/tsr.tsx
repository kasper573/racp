import { ReactElement } from "react";
import { base64decode, base64encode } from "byte-base64";
import { TSRBuilder } from "../lib/tsr/tsr";

const defaultOptions = {
  title: "",
  icon: <></>,
};

export const t = new TSRBuilder()
  .meta<typeof defaultOptions>()
  .renders<ReactElement | null>()
  .protocol({
    parse: (s) => JSON.parse(base64decode(s)),
    stringify: (x) => base64encode(JSON.stringify(x)),
  })
  .build({
    path: "" as const,
    params: {},
    meta: defaultOptions,
    renderer: ({ children }) => <>{children}</>,
    children: {},
    middlewares: [],
  });
