import { CustomErrorParams } from "zod/lib/types";

export function createPropertyMatchRefiner<A extends string, B extends string>(
  a: A,
  b: B,
  message: string
): [(data: Partial<Record<A | B, string>>) => boolean, CustomErrorParams] {
  return [
    (data) => data[a] === data[b],
    {
      message,
      path: [b],
    },
  ];
}
