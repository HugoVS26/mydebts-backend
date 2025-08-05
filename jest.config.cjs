const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  resolver: 'jest-ts-webcompat-resolver',
  collectCoverageFrom: [
    '**/*.ts',
    '!src/index.ts',
    '!src/server/app.ts',
    '!src/database/index.ts',
    '!src/setupTest.ts',
    '!**/node_modules/**',
  ],
};
