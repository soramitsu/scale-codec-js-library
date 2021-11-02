// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['esbuild-jest', { sourcemap: true, target: 'es2020' }],
    },
    testMatch: ['**/src/**/*.spec.ts'],
    moduleNameMapper: {
        '@scale-codec/definition-runtime': path.resolve(__dirname, 'runtime-rollup/index.cjs.js'),
    },
};
