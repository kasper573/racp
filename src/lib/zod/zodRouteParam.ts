import { ParamParser } from "react-typesafe-routes";
import { ZodType } from "zod";
import { isEmpty, isPlainObject, omitBy } from "lodash";

export function zodRouteParam<T>(type: ZodType<T>): ParamParser<T> {
  return {
    parse: (s?: string) => {
      s = s?.trim();
      return type.parse(
        isEmpty(s) ? undefined : JSON.parse(decodeURIComponent(s!))
      );
    },
    serialize: (x: T) => {
      let payload: unknown = x;
      if (isPlainObject(payload)) {
        payload = omitBy(payload as object, (v) => v === undefined);
      }
      return isEmpty(payload)
        ? ""
        : encodeURIComponent(JSON.stringify(payload));
    },
  };
}
