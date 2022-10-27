import "./fixtures/roboto";
import { createRoot } from "react-dom/client";
import { createBrowserHistory } from "history";
import { QueryClient } from "@tanstack/react-query";
import { App } from "./App";
import { rootId } from "./layout/globalStyles";
import { authStore, setupAuthBehavior } from "./state/auth";
import {
  createTRPCClientOptions,
  exposeTRPCClientProxy,
  trpc,
} from "./state/client";
import { routerObject } from "./router";

const root = document.getElementById(rootId);
if (root) {
  const history = createBrowserHistory();
  const trpcOptions = createTRPCClientOptions(() => authStore.getState().token);
  const trpcClient = trpc.createClient(trpcOptions);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 * 10, // 10 minutes
      },
    },
  });

  exposeTRPCClientProxy(trpcOptions);
  setupAuthBehavior({
    history,
    onTokenChanged: () => queryClient.resetQueries(),
  });

  createRoot(root).render(
    <App {...{ history, trpcClient, queryClient, router: routerObject }} />
  );
}
