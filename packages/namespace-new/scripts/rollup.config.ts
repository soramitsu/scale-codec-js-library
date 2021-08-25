import { defineConfig, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

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

function rollDeclaration({
    inputDts,
    outputBase,
    external,
    withoutSuffix,
}: {
    inputDts: string;
    outputBase: string;
    external?: string[];
    withoutSuffix?: boolean;
}): RollupOptions {
    return {
        input: `${inputDts}.d.ts`,
        plugins: [dts()],
        output: withoutSuffix
            ? {
                  file: `${outputBase}.d.ts`,
                  format: 'esm',
              }
            : [
                  {
                      file: `${outputBase}.esm.d.ts`,
                      format: 'esm',
                  },
                  {
                      file: `${outputBase}.cjs.d.ts`,
                      format: 'esm',
                  },
              ],
        external,
    };
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
    rollDeclaration({
        inputDts: '.declaration/namespace-new/src/lib',
        outputBase: 'dist/lib',
        withoutSuffix: true,
    }),
    // ...[...stds()]
    //     .map<RollupOptions[]>((x) => [
    //         {
    //             input: `src/std/${x}.ts`,
    //             external: ['@scale-codec/namespace-next'],
    //             plugins: [esbuild()],
    //             output: [
    //                 {
    //                     file: `dist/std/${x}/index.esm.js`,
    //                     format: 'esm',
    //                 },
    //                 {
    //                     file: `dist/std/${x}/index.cjs.js`,
    //                     format: 'cjs',
    //                 },
    //             ],
    //         },
    //         rollDeclaration({
    //             inputDts: `.declaration/namespace-new/src/std/${x}`,
    //             outputBase: `dist/std/${x}/index`,
    //             external: ['@scale-codec/namespace-next'],
    //         }),
    //     ])
    //     .flat(1),
]);
