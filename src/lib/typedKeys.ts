export function typedKeys<T>(o?: T): Array<keyof T> {
  return o !== undefined ? (Object.keys(o) as Array<keyof T>) : [];
}
