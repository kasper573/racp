import { createTRPCReact, httpBatchLink } from "@trpc/react";
import { ApiRouter } from "../../api/services/router";

export const trpc = createTRPCReact<ApiRouter>();

export function createTRPCClient(getToken: () => string | undefined) {
  return trpc.createClient({
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
