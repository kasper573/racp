import { typedKeys } from "./typedKeys";

export function collect<S, C extends Collectors<S>>(
  values: Iterable<S>,
  collectors: C,
  process?: <T>(collected: T[]) => T[]
): Collection<S, C> {
  const keys = typedKeys(collectors);
  const sum = {} as Collection<S, C>;
  for (const key of keys) {
    const collectKey = collectors[key];
    const collected = [] as Collected;
    type Collected = ReturnType<typeof collectKey>;
    for (const value of values) {
      collected.push(...collectKey(value));
    }
    sum[key] = (process ? process(collected) : collected) as Collected;
  }
  return sum;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Collectors<Source> = Record<string, (source: Source) => any[]>;
type Collection<Source, C extends Collectors<Source>> = {
  [K in keyof C]: ReturnType<C[K]>;
};
