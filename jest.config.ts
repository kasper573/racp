import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./src/setupTests.ts"],
  globals: {
    "ts-jest": {
      tsconfig: {
        target: "es6",
        module: "CommonJS",
      },
    },
  },
};

export default config;
