import "./fixtures/roboto";
import { createRoot } from "react-dom/client";
import { createBrowserHistory } from "history";
import { QueryClient } from "@tanstack/react-query";
import { App } from "./App";
import { rootId } from "./layout/globalStyles";
import { authStore, setupAuthBehavior } from "./state/auth";
import { createTRPCClient } from "./state/client";
import { router } from "./router";

const root = document.getElementById(rootId);
if (root) {
  const history = createBrowserHistory();
  const trpcClient = createTRPCClient(() => authStore.getState().token);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 * 10, // 10 minutes
      },
    },
  });
  setupAuthBehavior({
    history,
    onTokenChanged: () => queryClient.resetQueries(),
  });
  createRoot(root).render(
    <App {...{ history, trpcClient, queryClient, router }} />
  );
}
