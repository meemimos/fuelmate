module.exports = {
  displayName: 'mobile',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/app/**/*.test.ts', '<rootDir>/app/**/*.test.tsx', '<rootDir>/components/**/*.test.ts', '<rootDir>/components/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
