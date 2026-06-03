/** @type {import('jest').Config} */
const config = {
  collectCoverageFrom: ['src/**/*.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript'
          },
          target: 'es2024'
        },
        module: {
          type: 'es6'
        },
        sourceMaps: true
      }
    ]
  }
};

export default config;
