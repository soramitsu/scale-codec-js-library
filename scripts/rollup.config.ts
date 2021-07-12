import { RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
        dir: 'namespace',
        external: ['jsbi', '@scale-codec/core', '@scale-codec/util'],
    },
    {
        dir: 'namespace-codegen',
        external: ['case', '@scale-codec/namespace', '@scale-codec/enum', '@scale-codec/util'],
    },
];

const configs: RollupOptions[] = [];

for (const { dir, external } of packages) {
    const input = `packages/${dir}/src/lib.ts`;

    configs.push({
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
    });

    configs.push({
        input,
        output: {
            file: `packages/${dir}/dist/lib.d.ts`,
            format: 'es',
        },
        plugins: [dts()],
        external,
    });
}

export default configs;
