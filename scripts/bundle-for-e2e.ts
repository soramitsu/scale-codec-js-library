import { build, Format } from 'esbuild'
import { path } from 'zx'

const OUT_DIR = path.resolve(__dirname, '../e2e-spa/runtime-rollup')
const IN_FILE = path.resolve(__dirname, '../packages/definition-runtime/src/lib.ts')

async function buildPreset({ format }: { format: Format }) {
    await build({
        entryPoints: [IN_FILE],
        outfile: path.join(OUT_DIR, `index.${format}.js`),
        bundle: true,
        format,
        target: 'esnext',
        logLevel: 'info',
    })
}

export default async function () {
    await Promise.all([buildPreset({ format: 'esm' }), buildPreset({ format: 'cjs' })])
}
