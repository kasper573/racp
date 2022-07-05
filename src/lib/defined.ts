export function defined<T>(items: Array<T>) {
  return items.filter(Boolean) as Array<Exclude<T, Falsy>>;
}

type Falsy = undefined | null | boolean;
