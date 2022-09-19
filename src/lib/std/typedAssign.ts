export function typedAssign<T>(o: T, props: Partial<T>): T {
  return Object.assign(o, props);
}
