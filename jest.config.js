module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['esbuild-jest', { sourcemap: true, target: 'es2020' }],
    },
    testMatch: [
        '**/packages/**/*.spec.ts',
        '**/packages/**/__tests__/**/*.ts',
        '!**/packages/namespace*/**',
        '!**/*.d.ts',
    ],
    roots: ['<rootDir>/packages'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePathIgnorePatterns: ['/dist/'],
};
