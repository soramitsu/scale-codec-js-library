import 'jake'
import { $, cd, path } from 'zx'
import chalk from 'chalk'
import fs from 'fs/promises'
import fsExtra from 'fs-extra'
import del from 'del'
import * as esbuild from 'esbuild'
import consola from 'consola'
import * as ApiExtractor from '@microsoft/api-extractor'
import * as DEFINITION_COMPILER_SAMPLES from '../packages/definition-compiler/tests/__samples__'
import { renderNamespaceDefinition } from '../packages/definition-compiler'
import DOCS_NAMESPACE_DEFINITION from '../packages/docs/src/snippets/namespace-schema'
import {
  API_DOCUMENTER_OUTPUT,
  API_EXTRACTOR_TMP_DIR,
  BUILD_ARTIFACTS_GLOBS,
  COMPILER_SAMPLES_OUTPUT_DIR,
  DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH,
  E2E_ROOT,
  E2E_RUNTIME_ROLLUP_OUTPUT_DIR,
  MONOREPO_ROOT,
  PACKAGE_EXTERNALS,
  PUBLIC_PACKAGES_UNSCOPED,
  TSC_BUILD_OUTPUT_DIR,
  resolveApiExtractorConfig,
  resolvePackageDeclarationEntry,
  resolvePackageDist,
  resolvePackageEntrypoint,
  scoped,
} from './meta'
import { PackageJson } from 'type-fest'

async function extractApi(localBuild = false): Promise<void> {
  for (const unscopedPackageName of PUBLIC_PACKAGES_UNSCOPED) {
    const extractorConfigFile = resolveApiExtractorConfig(unscopedPackageName)
    const config = ApiExtractor.ExtractorConfig.loadFileAndPrepare(extractorConfigFile)
    const extractorResult = ApiExtractor.Extractor.invoke(config, {
      localBuild,
      showVerboseMessages: true,
    })
    if (extractorResult.succeeded) {
      consola.success(chalk`API Extractor completed successfully (for {blue.bold ${unscopedPackageName}})`)
    } else {
      consola.fatal(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      )
      throw new Error('Extractor failed')
    }
  }
}

desc('Clean all build artifacts')
task('clean', async () => {
  await del(BUILD_ARTIFACTS_GLOBS)
})

namespace('compiler-samples', () => {
  desc('Clean compiler samples')
  task('clean', async () => {
    await del(COMPILER_SAMPLES_OUTPUT_DIR)
  })

  task('prepare-dir', async () => {
    await fsExtra.ensureDir(COMPILER_SAMPLES_OUTPUT_DIR)
  })

  desc('Compile samples')
  task('compile', ['clean', 'prepare-dir'], async () => {
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
})

desc('Compile namespace from documentation to be used within snippet')
task('compile-docs-namespace', async () => {
  const content = renderNamespaceDefinition(DOCS_NAMESPACE_DEFINITION)
  await fs.writeFile(DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH, content)
})

task('build-types-only', ['clean'], async () => {
  await $`pnpm tsc -p tsconfig.declaration.json`
})

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
task('build-types-node-modules', ['build-types-only'], async () => {
  for (const pkg of PUBLIC_PACKAGES_UNSCOPED) {
    const dirInNodeModules = path.resolve(TSC_BUILD_OUTPUT_DIR, 'node_modules', scoped(pkg))
    const pkgLibFile = resolvePackageDeclarationEntry(pkg)
    const libFileRelative = path.relative(dirInNodeModules, pkgLibFile)
    const packageJson: PackageJson = { main: libFileRelative }
    const packageJsonFile = path.resolve(dirInNodeModules, 'package.json')
    await fsExtra.outputFile(packageJsonFile, JSON.stringify(packageJson))
    consola.info(chalk`Written: {blue.bold ${path.relative(MONOREPO_ROOT, packageJsonFile)}}`)
  }
})

desc('Build types')
task('build-types', ['clean', 'build-types-only', 'build-types-node-modules'])

namespace('api', () => {
  desc('Extract APIs and fail if they mismatch')
  task('extract', ['build-types'], async () => {
    await extractApi()
  })

  desc('Extract APIs and update them')
  task('extract-local', ['build-types', 'extract-local-only'])

  desc('Extarct API in local mode without build')
  task('extract-local-only', async () => {
    await extractApi(true)
  })

  desc('Extarct API without build')
  task('extract-only', async () => {
    await extractApi()
  })

  desc('Generate Markdown docs from extracted APIs')
  task('document', ['extract'], async () => {
    await $`pnpm api-documenter markdown -i ${API_EXTRACTOR_TMP_DIR} -o ${API_DOCUMENTER_OUTPUT}`
  })

  desc('Shorthand for both extract and document apis')
  task('extract-and-document', ['extract', 'document'])
})

namespace('test', () => {
  desc('Run unit-tests')
  task('unit', async () => {
    await $`pnpm test:unit`
  })

  desc('Run end-to-end SPA test')
  task('e2e-spa', ['build', 'bundle-e2e'], async () => {
    cd(E2E_ROOT)
    await $`pnpm test`
    cd(__dirname)
  })

  desc('Run all tests')
  task('all', ['unit', 'e2e-spa'])
})

task('type-check', async () => {
  await $`pnpm type-check`
})

task('lint-check', async () => {
  await $`pnpm lint:check`
})

task('bundle', ['clean'], async () => {
  for (const unscopedPackageName of PUBLIC_PACKAGES_UNSCOPED) {
    for (const format of ['esm', 'cjs'] as const) {
      await esbuild.build({
        entryPoints: [resolvePackageEntrypoint(unscopedPackageName)],
        outfile: path.join(resolvePackageDist(unscopedPackageName), `lib.${format}.js`),
        bundle: true,
        external: PACKAGE_EXTERNALS[unscopedPackageName],
        logLevel: 'info',
        target: 'esnext',
        platform: 'neutral',
        format,
      })
    }
  }
})

task('bundle-e2e', ['clean'], async () => {
  const IN_FILE = resolvePackageEntrypoint('definition-runtime')
  for (const format of ['esm', 'cjs'] as const) {
    await esbuild.build({
      entryPoints: [IN_FILE],
      outfile: path.join(E2E_RUNTIME_ROLLUP_OUTPUT_DIR, `index.${format}.js`),
      bundle: true,
      format,
      target: 'esnext',
      logLevel: 'info',
    })
  }
})

desc('Build packages, extract APIs and documentation')
task('build', ['clean', 'build-types', 'api:extract', 'bundle', 'api:document'])

desc('All-in-one code check')
task('check-code-integrity', [
  'compiler-samples:compile',
  'type-check',
  'lint-check',
  'test:unit',
  'build',
  'test:e2e-spa',
])

desc('Publish built packages. It does not build packages, only publish them.')
task('publish-all', async () => {
  const pnpmFilters = PUBLIC_PACKAGES_UNSCOPED.map((x) => [`--filter`, x]).flat()
  await $`pnpm ${pnpmFilters} publish --no-git-checks --access public`
  consola.info('Published!')
})
