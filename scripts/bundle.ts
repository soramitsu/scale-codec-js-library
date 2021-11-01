import { build, Format } from 'esbuild';
import { path } from 'zx';

const ROOT = path.resolve(__dirname, '../');

interface Options {
    /**
     * Unscoped package name
     */
    name: string;
    external?: string[];
}

const opts: Options[] = [
    {
        name: 'enum',
    },
    {
        name: 'util',
    },
    {
        name: 'core',
        external: ['jsbi', '@scale-codec/enum', '@scale-codec/util'],
    },
    {
        name: 'definition-compiler',
        external: ['sort-es', 'immutable', '@scale-codec/enum', '@scale-codec/util', '@scale-codec/core'],
    },
    {
        name: 'definition-runtime',
        external: ['@scale-codec/enum', '@scale-codec/util', '@scale-codec/core'],
    },
];

export default async function () {
    await Promise.all(
        opts.map(async (x) => {
            const inputFile = path.resolve(ROOT, 'packages', x.name, 'src/lib.ts');

            await Promise.all(
                (['esm', 'cjs'] as Format[]).map((format) =>
                    build({
                        entryPoints: [inputFile],
                        outfile: path.resolve(ROOT, 'packages', x.name, `dist/lib.${format}.js`),
                        bundle: true,
                        external: x.external,
                        logLevel: 'info',
                        target: 'esnext',
                        platform: 'neutral',
                        format,
                    }),
                ),
            );
        }),
    );
}
