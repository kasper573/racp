import { ZodType } from "zod";
import { isEmpty, isPlainObject, omitBy } from "lodash";
import { base64encode, base64decode } from "byte-base64";

export function zodRouteParam<T>(type: ZodType<T>) {
  return {
    parse: (s?: string) => {
      s = s?.trim();
      return type.parse(
        isEmpty(s) ? undefined : parseUrlJson(decodeURIComponent(s!))
      );
    },
    serialize: (x: T) => {
      let payload: unknown = x;
      if (isPlainObject(payload)) {
        payload = omitBy(payload as object, (v) => v === undefined);
      }
      return isEmpty(payload)
        ? ""
        : encodeURIComponent(stringifyUrlJson(payload));
    },
  };
}

const parseUrlJson = (s: string) => JSON.parse(base64decode(s));
const stringifyUrlJson = (x: unknown) => base64encode(JSON.stringify(x));
