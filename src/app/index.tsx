import { createRoot } from "react-dom/client";
import { App } from "./App";

let rootElement = document.getElementById("root");
if (!rootElement) {
  rootElement = document.createElement("div");
  document.body.appendChild(rootElement);
}

createRoot(rootElement).render(<App />);
