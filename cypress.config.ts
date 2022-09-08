import { defineConfig } from "cypress";

export default defineConfig({
  integrationFolder: "cypress/e2e",
  testFiles: "**/*.spec.ts",
  fixturesFolder: false,
});
