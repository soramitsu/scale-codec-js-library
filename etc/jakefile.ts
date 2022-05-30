import 'jake'
import { $, cd, chalk, path } from 'zx'
import fs from 'fs/promises'
import del from 'del'
import * as esbuild from 'esbuild'
import consola from 'consola'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
// import compileDocsNamespace from './scripts/compile-docs-namespace'
// import compileCompilerSamples from './scripts/compile-compiler-samples'
// import bundle from './scripts/bundle'
// import bundleForE2e from './scripts/bundle-for-e2e'
import makeDir from 'make-dir'
import * as samples from '../packages/definition-compiler/tests/__samples__'
import { renderNamespaceDefinition } from '../packages/definition-compiler/src/lib'
import DOCS_NAMESPACE_DEFINITION from '../packages/docs/src/snippets/namespace-schema'
import {
  API_DOCUMENTER_OUTPUT,
  API_EXTRACTOR_TMP_DIR,
  BUILD_ARTIFACTS_GLOBS,
  COMPILER_SAMPLES_OUTPUT_DIR,
  DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH,
  E2E_ROOT,
  E2E_RUNTIME_ROLLUP_OUTPUT_DIR,
  PACKAGE_EXTERNALS,
  PUBLIC_PACKAGES_UNSCOPED,
  SCOPE,
  ScaleCodecPackageUnscopedName,
  resolveApiExtractorConfig,
  resolvePackageDist,
  resolvePackageEntrypoint,
  resolveTSCPackageOutput,
  resolveTSCPackageOutputMove,
} from './meta'

async function extractApi(localBuild = false): Promise<void> {
  for (const unscopedPackageName of PUBLIC_PACKAGES_UNSCOPED) {
    const extractorConfigFile = resolveApiExtractorConfig(unscopedPackageName)
    const config = ExtractorConfig.loadFileAndPrepare(extractorConfigFile)
    const extractorResult = Extractor.invoke(config, {
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
    await makeDir(COMPILER_SAMPLES_OUTPUT_DIR)
  })

  desc('Compile samples')
  task('compile', ['clean', 'prepare-dir'], async () => {
    const entries = Object.entries(samples)

    await Promise.all(
      entries
        .filter(([id]) => id !== 'default')
        .map(async ([id, { def }]) => {
          const code = renderNamespaceDefinition(def)
          const file = path.join(COMPILER_SAMPLES_OUTPUT_DIR, `${id}.ts`)
          await fs.writeFile(file, code)
          consola.info(chalk`Written: {blue.bold ${file}}`)
        }),
    )
  })
})

desc('Compile namespace from documentation to be used within snippet')
task('compile-docs-namespace', async () => {
  const content = renderNamespaceDefinition(DOCS_NAMESPACE_DEFINITION)
  await fs.writeFile(DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH, content)
})

desc('Run tsc and split its output to packages')
task('build-ts', ['clean'], async () => {
  // Main TypeScript build into root `dist` dir
  await $`pnpm tsc --emitDeclarationOnly`

  // Copying compiled internals into each package's own `dist` dir
  await Promise.all(
    PUBLIC_PACKAGES_UNSCOPED.map(async (pkg) => {
      const dirFrom = resolveTSCPackageOutput(pkg)
      const dirTo = resolveTSCPackageOutputMove(pkg)
      await $`cp -r ${dirFrom} ${dirTo}`
    }),
  )
})

namespace('api', () => {
  desc('Extract APIs and fail if they mismatch')
  task('extract', ['build-ts'], async () => {
    await extractApi()
  })

  desc('Extract APIs and update them')
  task('extract-local', ['build-ts'], async () => {
    await extractApi(true)
  })

  desc('Generate Markdown docs from extracted APIs')
  task('document', ['extract'], async () => {
    await $`pnpx api-documenter markdown -i ${API_EXTRACTOR_TMP_DIR} -o ${API_DOCUMENTER_OUTPUT}`
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

task('bundle', ['clean'], async () => {
  for (const unscopedPackageName of PUBLIC_PACKAGES_UNSCOPED) {
    for (const format of ['esm', 'cjs'] as const) {
      esbuild.build({
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
task('build', ['clean', 'build-ts', 'api:extract', 'bundle', 'api:document'])

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
