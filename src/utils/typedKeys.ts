export function typedKeys<T>(o: T) {
  return Object.keys(o) as Array<keyof T>;
}
