module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': 'esbuild-jest',
    },
    testMatch: ['**/packages/**/*.spec.ts', '**/packages/**/__tests__/**/*.ts'],
    roots: ['<rootDir>/packages'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePathIgnorePatterns: ['/dist/'],
    moduleNameMapper: {
        '^@scale-codec/(.*)$': '<rootDir>/packages/$1/src/lib.ts',
    },
};
