import { createTRPCReact, httpBatchLink } from "@trpc/react";
import { createTRPCProxyClient } from "@trpc/client";
import { ApiRouter } from "../../api/router";

export const trpc = createTRPCReact<ApiRouter>();

export function createTRPCClientOptions(getToken: () => string | undefined) {
  return ({
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
  });
}


/**
 * Used to share client instance with e2e test runner.
 */
export function exposeTRPCClientProxy(options: ReturnType<typeof createTRPCClientOptions>) {
  window.trpcClientProxy = createTRPCProxyClient<ApiRouter>(options);
}

export interface TRPCClientWindowExtension {
  trpcClientProxy?: ReturnType<typeof createTRPCProxyClient<ApiRouter>>;
}