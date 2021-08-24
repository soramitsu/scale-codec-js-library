import { defineConfig, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
// import multi from '@rollup/plugin-multi-entry';

function* stds(): Generator<string> {
    for (const bits of [8, 16, 32, 64, 128]) {
        for (const type of ['u', 'i']) {
            yield `${type}${bits}`;
        }
    }

    for (const i of ['str', 'bool', 'Void', 'Compact']) {
        yield i;
    }
}

export default defineConfig([
    {
        input: 'src/lib.ts',
        plugins: [esbuild()],
        external: ['jsbi', '@scale-codec/enum', '@scale-codec/core', '@scale-codec/util', 'map-obj'],
        output: [
            {
                file: 'dist/lib.esm.js',
                format: 'esm',
            },
            {
                file: 'dist/lib.cjs.js',
                format: 'cjs',
            },
        ],
    },
    ...[...stds()].map<RollupOptions>((x) => ({
        input: `src/std/${x}.ts`,
        external: ['@scale-codec/namespace-next'],
        plugins: [esbuild()],
        output: [
            {
                file: `dist/std/${x}/index.esm.js`,
                format: 'esm',
            },
            {
                file: `dist/std/${x}/index.cjs.js`,
                format: 'cjs',
            },
        ],
    })),
]);
