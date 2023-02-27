import * as path from "path";
import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvFlowPlugin = require("cypress-dotenv-flow");

export default defineConfig({
  // Using a custom build of mocha-junit-reporter that support more placeholders
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

    // High timeout explained:
    // The default timeout is not enough due to a lot of our e2e flows involving navigating between several pages,
    // which causes lazy loading of JS due to code splitting, which on some dry runs cause delays.
    // The default timeout would work in most cases, but we want to be safe and not have flaky tests.
    defaultCommandTimeout: 10000,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
