/** @type {import('ts-jest').JestConfigWithTsJest} */
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
    '!src/setupTests.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^chalk$': './__mocks__/chalk.ts',
  },
  modulePathIgnorePatterns: ['./dist/'],
};
