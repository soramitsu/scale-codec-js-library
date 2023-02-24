import { Format, Options, defineConfig } from 'tsup'
import {
  E2E_RUNTIME_ROLLUP_OUTPUT_DIR,
  PACKAGE_EXTERNALS,
  PUBLIC_PACKAGES_UNSCOPED,
  resolvePackageDist,
  resolvePackageEntrypoint,
} from './etc/meta'
import { match } from 'ts-pattern'

function* configs(): Generator<Options> {
  const outExtension: (props: { format: Format }) => { js: string } = ({ format }) => {
    const js = match(format)
      .with('esm', () => '.mjs')
      .with('cjs', () => '.cjs')
      .with('iife', () => {
        throw new Error('unreachable')
      })
      .exhaustive()

    return { js }
  }

  for (const pkg of PUBLIC_PACKAGES_UNSCOPED) {
    yield {
      entry: {
        lib: resolvePackageEntrypoint(pkg, 'ts'),
      },
      outDir: resolvePackageDist(pkg),
      format: ['esm', 'cjs'],
      target: 'esnext',
      dts: true,
      external: PACKAGE_EXTERNALS[pkg],
      outExtension,
    }
  }

  // also additional config for e2e-app
  yield {
    entry: {
      index: resolvePackageEntrypoint('definition-runtime', 'ts'),
    },
    bundle: true,
    target: 'esnext',
    format: ['esm', 'cjs'],
    outDir: E2E_RUNTIME_ROLLUP_OUTPUT_DIR,
    outExtension: ({ format }) => ({ js: `.${format}.js` }),
  }
}

export default defineConfig([...configs()])
