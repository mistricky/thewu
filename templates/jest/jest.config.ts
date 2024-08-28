import { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/specs"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
} as Config;
