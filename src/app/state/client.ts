import { createTRPCReact, httpBatchLink } from "@trpc/react";
import { createTRPCProxyClient } from "@trpc/client";
import { ApiRouter } from "../../api/router";

export const trpc = createTRPCReact<ApiRouter>({
  // Invalidate any and all queries whenever a mutation is performed
  // This is to emulate the automatic invalidation that rtk-query would provide (which is what we would want).
  // But tRPC has no rtk-query bindings, so instead we have to make to with this solution for react-query.
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

export function createTRPCClientOptions(getToken: () => string | undefined) {
  return {
    links: [
      httpBatchLink({
        url: process.env.apiBaseUrl!,
        headers() {
          const token = getToken();
          if (token) {
            return {
              Authorization: `Bearer ${token}`,
            };
          }
          return {};
        },
      }),
    ],
  };
}

/**
 * Used to share client instance with e2e test runner.
 */
export function exposeTRPCClientProxy(
  options: ReturnType<typeof createTRPCClientOptions>
) {
  const proxy = createTRPCProxyClient<ApiRouter>(options);
  window.trpcClientProxy = proxy;
  return proxy;
}

export interface TRPCClientWindowExtension {
  trpcClientProxy?: ReturnType<typeof exposeTRPCClientProxy>;
}
