import { ReactElement } from "react";
import { base64decode, base64encode } from "byte-base64";
import { isEmpty, isPlainObject, isUndefined, omitBy } from "lodash";
import { TSRBuilder } from "../lib/tsr/tsr";
import { createDefaultParamCodec } from "../lib/tsr/utils/createDefaultParamCodec";
import { AnyRouteLike } from "../lib/tsr/types";

const defaultOptions = {
  title: "",
  icon: <></>,
};

export const t = new TSRBuilder()
  .meta<typeof defaultOptions>()
  .renders<ReactElement | null>()
  .codec(
    createDefaultParamCodec(
      (x) =>
        isEmpty(compact(x)) ? undefined : base64encode(JSON.stringify(x)),
      (s) => (isEmpty(s) ? [] : JSON.parse(base64decode(s)))
    )
  )
  .build({
    path: "" as const,
    params: {},
    meta: defaultOptions,
    renderer: ({ children }) => <>{children}</>,
    children: {},
    middlewares: [],
  });

const compact = (o: unknown) =>
  isPlainObject(o) ? omitBy(o as object, isUndefined) : o;

export type Route = AnyRouteLike<typeof t.route>;
