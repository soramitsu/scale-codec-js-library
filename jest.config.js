module.exports = {
    testEnvironment: 'node',
    transform: {
        '\\.(ts|js)$': ['esbuild-runner/jest'],
        // '\\.ts$': ['esbuild-jest', { sourcemap: true, target: 'es2020' }],
    },
    transformIgnorePatterns: [],
    testMatch: [
        '**/packages/**/*.spec.ts',
        '**/packages/**/__tests__/**/*.ts',
        '!**/packages/namespace*/**',
        '!**/*.d.ts',
    ],
    roots: ['<rootDir>/packages'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', 'core/src/codecs/__tests__/util.ts'],
    modulePathIgnorePatterns: ['/dist/'],
}
