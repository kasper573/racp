import { defined } from "./defined";

export async function allResolved<T>(promises: Promise<T>[]): Promise<T[]> {
  const settled = await Promise.allSettled(promises);
  const values = settled.map((item) =>
    item.status === "fulfilled" ? item.value : undefined
  );
  return defined(values);
}
