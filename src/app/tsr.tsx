import { base64decode, base64encode } from "byte-base64";
import { isEmpty, isPlainObject, isUndefined, omitBy } from "lodash";
import { createTSR } from "../lib/tsr/tsr";
import { createDefaultParamCodec } from "../lib/tsr/utils/createDefaultParamCodec";
import { AnyRouteLike } from "../lib/tsr/types";
import { ReactRenderResult } from "../lib/tsr/react/types";

const defaultMeta = {
  title: "",
  icon: <></>,
};

export const t = createTSR<ReactRenderResult, typeof defaultMeta>({
  meta: defaultMeta,
  codec: createDefaultParamCodec(
    (x) => (isEmpty(compact(x)) ? undefined : base64encode(JSON.stringify(x))),
    (s) => (isEmpty(s) ? [] : JSON.parse(base64decode(s)))
  ),
});

const compact = (o: unknown) =>
  isPlainObject(o) ? omitBy(o as object, isUndefined) : o;

export type Route = AnyRouteLike<typeof t.route>;
