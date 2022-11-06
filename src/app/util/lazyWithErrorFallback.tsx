import { ComponentType, lazy } from "react";

export function lazyWithErrorFallback<T extends ComponentType<any>>(
  loadComponent: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await loadComponent();
    } catch (e) {
      console.error("Failed loading component", e);
      return Promise.resolve({
        default: createErrorFallback<T>(e),
      });
    }
  });
}

function createErrorFallback<T extends ComponentType<any>>(error: unknown): T {
  function ErrorFallback() {
    throw error;
  }
  return ErrorFallback as unknown as T;
}
