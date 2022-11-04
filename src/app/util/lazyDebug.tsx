import { ComponentType, lazy } from "react";

export function lazyDebug<T extends ComponentType<any>>(
  ctor: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return ctor();
    } catch (e) {
      console.log("Lazy loading failed", e);
      return Promise.resolve({
        default: createErrorBoundary(e) as unknown as T,
      });
    }
  });
}

function createErrorBoundary(error: unknown) {
  function ErrorBoundary() {
    return <>Error: {`${error}`}</>;
  }
  return ErrorBoundary;
}
