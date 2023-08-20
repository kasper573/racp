import { createTRPCReact, httpBatchLink } from "@trpc/react";
import { createTRPCProxyClient } from "@trpc/client";
import { ApiRouter } from "../../api/router";
import { transformer } from "../../transformer";

export const CANCEL_INVALIDATE = Symbol("CANCEL_INVALIDATE");

export const trpc = createTRPCReact<ApiRouter>({
  // Invalidate any and all queries whenever a mutation is performed
  // This is to emulate the automatic invalidation that rtk-query would provide (which is what we would want).
  // But tRPC has no rtk-query bindings, so instead we have to make to with this solution for react-query.
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        const res = await opts.originalFn();
        if (res !== CANCEL_INVALIDATE) {
          await opts.queryClient.invalidateQueries();
        }
      },
    },
  },
});

export function createTRPCClientOptions(getToken: () => string | undefined) {
  return {
    transformer,
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
