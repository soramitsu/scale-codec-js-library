import 'jake'
import { $, cd } from 'zx'
import chalk from 'chalk'
import fs from 'fs/promises'
import fsExtra from 'fs-extra'
import del from 'del'
import path from 'path'
import consola from 'consola'
import * as DEFINITION_COMPILER_SAMPLES from '../packages/definition-compiler/tests/__samples__'
import { renderNamespaceDefinition } from '../packages/definition-compiler/src/lib'
import {
  BUILD_ARTIFACTS_GLOBS,
  COMPILER_SAMPLES_OUTPUT_DIR,
  E2E_ROOT,
  MONOREPO_ROOT,
  PUBLIC_PACKAGES_UNSCOPED,
} from './meta'

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

  desc('tsup packages')
  task('tsup', async () => {
    await $`pnpm tsup`
  })

  task('typedoc', async () => {
    await $`pnpm typedoc`
  })
})

namespace('test', () => {
  desc('Run unit-tests')
  task('unit', async () => {
    await $`pnpm test:unit`
  })

  desc('Run end-to-end SPA test')
  task('e2e-spa', ['build:tsup'], async () => {
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

desc('Type-check packages, bundle and document')
task('build', ['type-check', 'build:tsup', 'build:typedoc'])

desc('All-in-one code check')
task('check-code-integrity', [
  'build:compiler-samples',
  'type-check',
  'lint-check',
  'test:unit',
  'build',
  'test:e2e-spa',
])

desc('Publish built packages. It does not build packages, only publishes them.')
task('publish-all', async () => {
  const pnpmFilters = PUBLIC_PACKAGES_UNSCOPED.map((x) => [`--filter`, x]).flat()
  await $`pnpm ${pnpmFilters} publish --access public`
  consola.info('Published!')
})
