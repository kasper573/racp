import { ComponentType, lazy } from "react";

export function lazyWithErrorFallback<T extends ComponentType<any>>(
  loadComponent: () => PromiseLike<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await tryNTimes(3, 1000, loadComponent);
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

// An async function that retries the given function up to n times with a delay between each attempt
async function tryNTimes<T>(
  n: number,
  delay: number,
  fn: () => PromiseLike<T>
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (n > 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return tryNTimes(n - 1, delay, fn);
    }
    throw e;
  }
}
