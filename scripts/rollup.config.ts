import { RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

const packages: {
    dir: string;
    external?: string[];
}[] = [
    {
        dir: 'enum',
    },
    {
        dir: 'util',
    },
    {
        dir: 'core',
        external: ['jsbi', '@scale-codec/enum', '@scale-codec/util'],
    },
    {
        dir: 'definition-compiler',
        external: ['vue', 'prettier', '@scale-codec/core'],
    },
    {
        dir: 'definition-runtime',
        external: ['@scale-codec/core'],
    },
    // {
    //     dir: 'namespace',
    //     external: ['jsbi', '@scale-codec/core', '@scale-codec/util'],
    // },
    // {
    //     dir: 'namespace-codegen',
    //     external: ['case', '@scale-codec/namespace', '@scale-codec/enum', '@scale-codec/util'],
    // },
];

const configs: RollupOptions[] = [];

for (const { dir, external } of packages) {
    const input = `packages/${dir}/src/lib.ts`;
    const inputDts = `.declaration/${dir}/src/lib.d.ts`;

    configs.push(
        {
            input,
            output: [
                {
                    file: `packages/${dir}/dist/lib.esm.js`,
                    format: 'es',
                },
                {
                    file: `packages/${dir}/dist/lib.cjs.js`,
                    format: 'cjs',
                },
            ],
            plugins: [
                esbuild({
                    minify: false,
                }),
                nodeResolve(),
            ],
            external,
        },
        {
            input: inputDts,
            output: {
                file: `packages/${dir}/dist/lib.d.ts`,
                format: 'es',
            },
            plugins: [dts()],
            external,
        },
    );
}

// // codegen cli

// configs.push({
//     input: 'packages/namespace-codegen-cli/src/main.ts',
//     output: {
//         file: 'packages/namespace-codegen-cli/dist/main.js',
//         format: 'cjs',
//     },
//     plugins: [esbuild({ minify: false }), nodeResolve({ preferBuiltins: true }), json(), commonjs()],
//     external: ['fs/promises'],
// });

export default configs;
