import { typedKeys } from "./typedKeys";

export function collectUnique<S, C extends Collectors<S>>(
  values: Iterable<S>,
  collectors: C
): Collection<S, C> {
  const keys = typedKeys(collectors);
  const sum = {} as Collection<S, C>;
  for (const key of keys) {
    const collect = collectors[key];
    const unique = [] as ReturnType<C[typeof key]>;
    for (const value of values) {
      for (const item of collect(value)) {
        if (!unique.includes(item)) {
          unique.push(item);
        }
      }
    }
    sum[key] = unique;
  }
  return sum;
}

type Collectors<S> = Record<string, (source: S) => unknown[]>;
type Collection<S, C extends Collectors<S>> = {
  [K in keyof C]: ReturnType<C[K]>;
};
