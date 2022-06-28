import "./fixtures/roboto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { createStore } from "./store";
import { rootId } from "./layout/globalStyles";
import { setupAuthBehavior } from "./state/auth";

const root = document.getElementById(rootId);
if (root) {
  const store = createStore();
  setupAuthBehavior(store, ({ auth }) => auth);
  createRoot(root).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}
