import { typedKeys } from "./typedKeys";

export function replaceMap<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  K extends keyof any,
  V
>(target: Map<K, V>, replacement?: Map<K, V>) {
  target.clear();
  if (!replacement) {
    return;
  }
  if (replacement instanceof Map) {
    for (const [key, value] of replacement.entries()) {
      target.set(key, value);
    }
    return;
  }
}

export function replaceObject<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  K extends keyof any,
  V
>(target: Record<K, V>, replacement?: Record<K, V>) {
  for (const key of typedKeys(target)) {
    delete target[key];
  }
  if (replacement) {
    for (const key of typedKeys(replacement)) {
      target[key] = replacement[key];
    }
  }
}
