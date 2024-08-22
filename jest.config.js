/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: 'node',
    rootDir: './',
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
    },
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
};
