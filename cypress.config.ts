import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "ic5gz7",
  e2e: {
    specPattern: "cypress/**/*.spec.ts",
    setupNodeEvents() {
      // Nothing
    },
  },
  fixturesFolder: false,
});
