import { RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
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
        dir: 'definition-compiler',
        external: ['vue', 'prettier', '@scale-codec/core'],
    },
    {
        dir: 'definition-runtime',
        external: ['@scale-codec/core'],
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
}

export default configs;
