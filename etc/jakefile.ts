import 'jake'
import { $, cd } from 'zx'
import chalk from 'chalk'
import fs from 'fs/promises'
import fsExtra from 'fs-extra'
import del from 'del'
import path from 'path'
import * as esbuild from 'esbuild'
import consola from 'consola'
import * as ApiExtractor from '@microsoft/api-extractor'
import * as DEFINITION_COMPILER_SAMPLES from '../packages/definition-compiler/tests/__samples__'
import { renderNamespaceDefinition } from '../packages/definition-compiler/src/lib'
import {
  BUILD_ARTIFACTS_GLOBS,
  COMPILER_SAMPLES_OUTPUT_DIR,
  E2E_ROOT,
  E2E_RUNTIME_ROLLUP_OUTPUT_DIR,
  MONOREPO_ROOT,
  PACKAGE_EXTERNALS,
  PUBLIC_PACKAGES_UNSCOPED,
  TSC_BUILD_OUTPUT_DIR,
  resolveApiExtractorConfig,
  resolvePackageDist,
  resolvePackageEntrypoint,
  scoped,
} from './meta'
import { PackageJson } from 'type-fest'
import ci from 'ci-info'

async function extractApi(): Promise<void> {
  const localBuild = !ci.isCI

  for (const unscopedPackageName of PUBLIC_PACKAGES_UNSCOPED) {
    const extractorConfigFile = resolveApiExtractorConfig(unscopedPackageName)
    const config = ApiExtractor.ExtractorConfig.loadFileAndPrepare(extractorConfigFile)
    const extractorResult = ApiExtractor.Extractor.invoke(config, {
      localBuild,
      showVerboseMessages: true,
    })
    if (extractorResult.succeeded) {
      consola.success(chalk`API Extractor succeeded for {magenta.bold ${unscopedPackageName}}`)
    } else {
      consola.fatal(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      )
      process.exit(1)
    }
  }
}

desc('Clean all build artifacts')
task('clean', async () => {
  await del(BUILD_ARTIFACTS_GLOBS)
})

namespace('build', () => {
  desc('Build compiler samples, generated with itself')
  task('compiler-samples', async () => {
    await del(COMPILER_SAMPLES_OUTPUT_DIR)
    await fsExtra.ensureDir(COMPILER_SAMPLES_OUTPUT_DIR)

    const entries = Object.entries(DEFINITION_COMPILER_SAMPLES)
    await Promise.all(
      entries
        .filter(([id]) => id !== 'default')
        .map(async ([id, { def }]) => {
          const code = renderNamespaceDefinition(def)
          const file = path.join(COMPILER_SAMPLES_OUTPUT_DIR, `${id}.ts`)
          await fs.writeFile(file, code)
          consola.info(chalk`Written: {blue.bold ${path.relative(MONOREPO_ROOT, file)}}`)
        }),
    )
  })

  desc('Build TypeScript')
  task(`typescript`, ['clean'], async () => {
    await $`pnpm tsc -p tsconfig.build.json`

    /**
     * Workaround for API Extractor.
     *
     * - It fails to resolve e.g. `@scale-codec/enum` from core package
     * - It fails if split each pkg declarations into package dir,
     *   because it tries to resolve to `lid.ts` file via node-resolution, which is not
     *   OK for it
     * - `tsconfig`s `paths` is not a solution because AE includes other package
     *    contents if it is resolved via paths for some reason
     *
     * Thus, this task creates a simple `node_modules` dir with `package.json`s mapped to
     * correct lib.d.ts files
     */
    for (const pkg of PUBLIC_PACKAGES_UNSCOPED) {
      const dirInNodeModules = path.resolve(TSC_BUILD_OUTPUT_DIR, 'node_modules', scoped(pkg))
      const pkgLibFile = resolvePackageEntrypoint(pkg, 'd.ts')
      const libFileRelative = path.relative(dirInNodeModules, pkgLibFile)
      const packageJson: PackageJson = { main: libFileRelative }
      const packageJsonFile = path.resolve(dirInNodeModules, 'package.json')
      await fsExtra.outputFile(packageJsonFile, JSON.stringify(packageJson))
      consola.info(chalk`Written: {blue.bold ${path.relative(MONOREPO_ROOT, packageJsonFile)}}`)
    }
  })

  const ESBUILD_COMMON_OPTIONS = {
    logLevel: 'info',
    target: 'esnext',
    platform: 'neutral',
  } satisfies esbuild.CommonOptions

  desc('Bundle built JS files into ESM/CJS targets')
  task('bundle-packages', ['typescript'], async () => {
    for (const pkg of PUBLIC_PACKAGES_UNSCOPED) {
      for (const format of ['esm', 'cjs'] as const) {
        await esbuild.build({
          ...ESBUILD_COMMON_OPTIONS,
          entryPoints: [resolvePackageEntrypoint(pkg, 'js')],
          outfile: path.join(resolvePackageDist(pkg), `lib.${format === 'esm' ? 'mjs' : 'cjs'}`),
          external: PACKAGE_EXTERNALS[pkg],
          bundle: true,
          format,
        })
      }
    }
  })

  desc('Bundle runtime package for e2e tests')
  task('bundle-runtime-for-e2e', ['clean'], async () => {
    for (const format of ['esm', 'cjs'] as const) {
      await esbuild.build({
        ...ESBUILD_COMMON_OPTIONS,
        entryPoints: [resolvePackageEntrypoint('definition-runtime', 'ts')],
        outfile: path.join(E2E_RUNTIME_ROLLUP_OUTPUT_DIR, `index.${format}.js`),
        bundle: true,
        format,
      })
    }
  })

  task('typedoc', async () => {
    await $`pnpm typedoc`
  })
})

namespace('api', () => {
  desc('Extract API without build')
  task('extract-only', async () => {
    await extractApi()
  })

  desc('Extract API. If they mismatch in CI, it fails, otherwise reports are updated')
  task('extract', ['build:typescript', 'extract-only'])
})

namespace('test', () => {
  desc('Run unit-tests')
  task('unit', async () => {
    await $`pnpm test:unit`
  })

  desc('Run end-to-end SPA test')
  task('e2e-spa', ['build:bundle-packages', 'build:bundle-runtime-for-e2e'], async () => {
    cd(E2E_ROOT)
    await $`pnpm test`
    cd(__dirname)
  })

  desc('Run all tests')
  task('all', ['unit', 'e2e-spa'])
})

task('lint-check', async () => {
  await $`pnpm lint:check`
})

task('type-check', async () => {
  await $`pnpm type-check`
})

desc('Build packages, extract APIs and documentation')
task('build', ['build:typescript', 'build:bundle-packages', 'api:extract', 'build:typedoc'])

desc('All-in-one code check')
task('check-code-integrity', [
  'build:compiler-samples',
  'type-check',
  'lint-check',
  'test:unit',
  'build:typescript',
  'test:e2e-spa',
])

desc('Publish built packages. It does not build packages, only publishes them.')
task('publish-all', async () => {
  const pnpmFilters = PUBLIC_PACKAGES_UNSCOPED.map((x) => [`--filter`, x]).flat()
  await $`pnpm ${pnpmFilters} publish --access public`
  consola.info('Published!')
})
