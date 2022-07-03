import "./fixtures/roboto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
import { App } from "./App";
import { createStore } from "./state/store";
import { rootId } from "./layout/globalStyles";
import { setupAuthBehavior } from "./slices/auth";

const root = document.getElementById(rootId);
if (root) {
  const history = createBrowserHistory();
  const store = createStore({ history });
  setupAuthBehavior(store, ({ auth }) => auth);
  createRoot(root).render(
    <StrictMode>
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    </StrictMode>
  );
}
