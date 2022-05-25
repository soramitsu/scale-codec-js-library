import { build, Format } from 'esbuild'
import { path } from 'zx'
import { E2E_RUNTIME_ROLLUP_OUTPUT_DIR as OUT_DIR, resolvePackageEntrypoint } from '../meta'

const IN_FILE = resolvePackageEntrypoint('definition-runtime')

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
