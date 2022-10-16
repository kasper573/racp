import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvFlowPlugin = require("cypress-dotenv-flow");

export default defineConfig({
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/reports/[hash].xml",
  },
  chromeWebSecurity: false, // Without this we sometimes get "Failed to fetch" error
  e2e: {
    specPattern: "cypress/**/auth.spec.ts",
    setupNodeEvents(on, config) {
      return dotenvFlowPlugin(config, undefined, true);
    },
  },
});
