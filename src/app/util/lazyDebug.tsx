import { ComponentType, lazy } from "react";

export function lazyDebug<T extends ComponentType<any>>(
  ctor: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await ctor();
    } catch (e) {
      console.error("Lazy loading failed", e);
      return Promise.resolve({
        default: createErrorBoundary<T>(e),
      });
    }
  });
}

function createErrorBoundary<T extends ComponentType<any>>(error: unknown): T {
  function ErrorBoundary() {
    throw error;
  }
  return ErrorBoundary as unknown as T;
}
