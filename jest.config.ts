/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['<rootDir>/**/src/test/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],

  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules', 'src/test'],
  reporters: ['default'],
  
  globals: { 'ts-jest': { diagnostics: false } },

  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};