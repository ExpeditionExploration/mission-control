/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    rootDir: './',
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
    },
    testEnvironment: 'node',
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
};
