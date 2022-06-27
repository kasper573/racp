import { typedKeys } from "./typedKeys";

export function collectUnique<S, C extends Collectors<S>>(
  values: Iterable<S>,
  collectors: C
): Collection<S, C> {
  const keys = typedKeys(collectors);
  const sum = {} as Collection<S, C>;
  for (const key of keys) {
    const collect = collectors[key];
    const unique = new Map<unknown, unknown>();
    for (const value of values) {
      for (const item of collect(value)) {
        unique.set(item, true);
      }
    }
    sum[key] = Array.from(unique.keys()) as ReturnType<C[typeof key]>;
  }
  return sum;
}

type Collectors<S> = Record<string, (source: S) => unknown[]>;
type Collection<S, C extends Collectors<S>> = {
  [K in keyof C]: ReturnType<C[K]>;
};
