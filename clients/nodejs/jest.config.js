export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
      '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    },
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    collectCoverageFrom: [
      'src/**/*.{ts,js}',
      '!src/server.ts',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/*.d.ts'
    ],
    testMatch: [
      '**/tests/**/*.test.ts'
    ],
    setupFiles: ['./tests/setup.ts'],
  };