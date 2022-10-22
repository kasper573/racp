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

    // These timeouts are very high to avoid flakiness due to API calls sometimes being slow in CI.
    // This is primarily due to a design flaw which makes the API preload a lot of data,
    // which often gets cache invalidated by admin operations done in various tests.
    // The proper solution is to make the API completely stateless,
    // but that's a lot of work, so this will do in the meantime.
    requestTimeout: 60000,
    defaultCommandTimeout: 60000,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
