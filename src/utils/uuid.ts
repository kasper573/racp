import { v4 } from "uuid";

export type UUID<T extends string> = `UUID<${T}>`;

export function uuid<T extends string>() {
  return v4() as UUID<T>;
}
