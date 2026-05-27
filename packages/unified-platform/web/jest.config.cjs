module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/src/__mocks__/setupTest.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '^@otelverse/ui-kit$': '<rootDir>/../../../libs/ui-kit/src/index.ts',
    '^@otelverse/api-hooks$': '<rootDir>/../../../libs/api-hooks/src/index.ts',
  },
}
