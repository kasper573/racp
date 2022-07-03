import { without } from "lodash";
import * as zod from "zod";

export type ToggleName = zod.infer<typeof toggleNameType>;
export const toggleNameType = zod.string();

export type ToggleRecord = zod.infer<typeof toggleRecordType>;
export const toggleRecordType = zod
  .record(toggleNameType, zod.boolean())
  .default({});

export function isToggleMatch(req?: ToggleName[], val?: ToggleRecord) {
  if (req === undefined) {
    return true;
  }
  if (val === undefined) {
    return req.length === 0;
  }
  for (const flag of req) {
    if (!val[flag]) {
      return false;
    }
  }
  return true;
}

export function isArrayMatch<T>(req?: T[], val?: T | T[]) {
  if (req === undefined) {
    return true;
  }
  if (val === undefined) {
    return req.length === 0;
  }
  if (Array.isArray(val)) {
    return without(req, ...val).length < req.length; // one of
  }
  return req.includes(val);
}

export function isRangeMatch(req?: [number, number], val = 0) {
  if (req === undefined) {
    return true;
  }
  const [min, max] = req;
  return val >= min && val <= max;
}

export function isStringMatch(req?: string, val?: string) {
  if (req === undefined) {
    return true;
  }
  if (val === undefined) {
    return req === "";
  }
  return val.toLowerCase().includes(req.toLowerCase());
}

export function isRefMatch<T>(req?: T, val?: T) {
  if (req === undefined) {
    return true;
  }
  return req === val;
}
