module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['esbuild-jest', { sourcemap: true }],
    },
    testMatch: ['**/src/**/*.spec.ts'],
};
