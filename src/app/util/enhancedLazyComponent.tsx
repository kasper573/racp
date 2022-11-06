import { ComponentType, lazy } from "react";

/**
 * React.lazy but with retry mechanism and errors are thrown
 * in the render loop (so they can be caught by Error Boundaries)
 */
export function enhancedLazyComponent<T extends ComponentType<any>>(
  loadComponent: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await tryUntilSuccess(3, 1000, loadComponent);
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

async function tryUntilSuccess<T>(
  maxAttempts: number,
  delayBetweenAttempts: number,
  operation: () => PromiseLike<T>
): Promise<T> {
  try {
    return await operation();
  } catch (e) {
    if (maxAttempts > 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
      return tryUntilSuccess(maxAttempts - 1, delayBetweenAttempts, operation);
    }
    throw e;
  }
}
