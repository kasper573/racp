import "./fixtures/roboto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { rootId } from "./layout/globalStyles";
import { authStore, setupAuthBehavior } from "./state/auth";
import { createTRPCClient, trpc } from "./state/client";

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
    <StrictMode>
      <Router history={history}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </trpc.Provider>
      </Router>
    </StrictMode>
  );
}
