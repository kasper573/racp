import { ComponentType, lazy } from "react";

export function lazyDebug<T extends ComponentType<any>>(
  ctor: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return ctor();
    } catch (e) {
      console.log("Lazy loading failed", e);
      throw e;
    }
  });
}
