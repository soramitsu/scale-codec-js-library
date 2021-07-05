module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/packages/**/*.spec.ts', '**/packages/**/__tests__/**/*.ts', '!**/namespace-codegen/e2e/**/*'],
    roots: ['<rootDir>/packages'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePathIgnorePatterns: ['/dist/'],
    moduleNameMapper: {
        '^@scale-codec/(.*)$': '<rootDir>/packages/$1/src/lib.ts',
    },
};
