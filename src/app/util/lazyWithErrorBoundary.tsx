import { ComponentType, lazy } from "react";

export function lazyWithErrorBoundary<T extends ComponentType<any>>(
  loadComponent: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await loadComponent();
    } catch (e) {
      console.error("Failed loading component", e);
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
