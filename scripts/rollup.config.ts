import { RollupOptions, defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';

function* publishConfigs(): Generator<RollupOptions> {
    const regularPublishRollups: {
        unscopedPackageName: string;
        external?: string | RegExp | (string | RegExp)[];
    }[] = [
        {
            unscopedPackageName: 'enum',
        },
        {
            unscopedPackageName: 'util',
        },
        {
            unscopedPackageName: 'core',
            external: ['jsbi', /^@scale-codec\./],
        },
        {
            unscopedPackageName: 'definition-compiler',
            external: ['vue', 'prettier', '@scale-codec/core'],
        },
        {
            unscopedPackageName: 'definition-runtime',
            external: ['@scale-codec/core'],
        },
    ];

    for (const { unscopedPackageName: dir, external } of regularPublishRollups) {
        const input = `packages/${dir}/src/lib.ts`;

        yield {
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
        };
    }
}

/**
 * Makes all-in-one `@scale-codec/definition-runtime` rollup without any externals
 * to test the whole runtime packages chain in e2e-spa
 */
function runtimeRollupForTest(): RollupOptions {
    return {
        input: 'packages/definition-runtime/src/lib.ts',
        plugins: [esbuild(), nodeResolve()],
        output: [
            {
                // for testing in Node.js
                file: 'e2e-spa/runtime-rollup/index.cjs.js',
                format: 'cjs',
            },
            {
                // for testing in Browser with Vite + Cypress
                file: 'e2e-spa/runtime-rollup/index.esm.js',
                format: 'esm',
            },
        ],
    };
}

export default defineConfig([...publishConfigs(), runtimeRollupForTest()]);
