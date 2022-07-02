import { without } from "lodash";

export function isToggleMatch(req?: string[], val?: Record<string, boolean>) {
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
    return without(req, ...val).length === 0;
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
