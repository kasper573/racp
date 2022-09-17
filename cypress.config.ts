import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvFlowPlugin = require("cypress-dotenv-flow");

export default defineConfig({
  e2e: {
    specPattern: "cypress/**/*.spec.ts",
    setupNodeEvents(on, config) {
      return dotenvFlowPlugin(config, undefined, true);
    },
  },
});

Cypress.Keyboard.defaults({
  // Disabling keystroke delay since it sometimes makes some characters fail to be typed
  keystrokeDelay: 0,
});
