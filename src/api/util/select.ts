export type Selector<V, S> = (value: V) => S[] | S | undefined;

export function select<V, S>(values: V[], selector: Selector<V, S>) {
  return values.reduce((list, value) => {
    const selected = selector(value);
    if (Array.isArray(selected)) {
      return [...list, ...selected];
    }
    if (selected === undefined) {
      return list;
    }
    return [...list, selected];
  }, [] as S[]);
}
