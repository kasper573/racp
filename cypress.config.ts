import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "ic5gz7",
  integrationFolder: "cypress/e2e",
  testFiles: "**/*.spec.ts",
  fixturesFolder: false,
});
