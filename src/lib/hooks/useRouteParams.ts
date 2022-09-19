import { mapValues } from "lodash";
import { useRouteParams as useBaseRouteParams } from "react-typesafe-routes";

/**
 * Corrected variant of useRouteParams that properly decodes all string values.
 * (The original function only decodes the query string, not the location string)
 */
export const useRouteParams: typeof useBaseRouteParams = (...args) => {
  const params = useBaseRouteParams(...args);
  return mapValues(
    params,
    (v) => (typeof v === "string" ? decodeURIComponent(v) : v)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
};
