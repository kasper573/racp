import "./fixtures/roboto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { createStore } from "./state/store";
import { rootId } from "./layout/globalStyles";
import { setupAuthBehavior } from "./slices/auth";
import { logoutRedirect } from "./router";
import { createTRPCClient, trpc } from "./state/client";

const root = document.getElementById(rootId);
if (root) {
  const history = createBrowserHistory();
  const store = createStore({ history, logoutRedirect });
  const trpcClient = createTRPCClient(() => store.getState().auth?.token);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 * 10, // 10 minutes
      },
    },
  });
  setupAuthBehavior(store, ({ auth }) => auth);
  createRoot(root).render(
    <StrictMode>
      <Provider store={store}>
        <Router history={history}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </trpc.Provider>
        </Router>
      </Provider>
    </StrictMode>
  );
}
