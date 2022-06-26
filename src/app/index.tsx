import "./fixtures/roboto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { createStore } from "./store";

let rootElement = document.getElementById("root");
if (!rootElement) {
  rootElement = document.createElement("div");
  document.body.appendChild(rootElement);
}

const store = createStore();

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
