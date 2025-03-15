const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
};

module.exports = createJestConfig(customJestConfig); 