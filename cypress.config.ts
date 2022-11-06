import * as path from "path";
import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvFlowPlugin = require("cypress-dotenv-flow");

export default defineConfig({
  // Using a custom build of mocha-junit-reporter that supports more placeholders
  reporter: path.resolve(__dirname, "node_modules", "mocha-junit-reporter"),

  reporterOptions: {
    mochaFile: "cypress/reports/[suiteFilename].xml",
  },

  // Without this we sometimes get "Failed to fetch" error
  chromeWebSecurity: false,

  e2e: {
    specPattern: "cypress/**/*.spec.ts",
    setupNodeEvents(on, config) {
      return dotenvFlowPlugin(config, undefined, true);
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
