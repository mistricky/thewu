const baseConfig = require("../../jest.config");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/specs"],
};
