import { series } from 'gulp'
import path from 'path'
import del from 'del'
import makeDir from 'make-dir'
import fs from 'fs/promises'
import consola from 'consola'
import chalk from 'chalk'
import * as samples from '../../packages/definition-compiler/tests/__samples__'
import { renderNamespaceDefinition } from '../../packages/definition-compiler/src/lib'
import { COMPILER_SAMPLES_OUTPUT_DIR as OUTPUT_DIR } from '../meta'

async function clean() {
  const cleanPath = path.join(OUTPUT_DIR, '*')
  consola.info(chalk`Cleaning {blue.bold ${path.relative(process.cwd(), cleanPath)}}`)
  await del(cleanPath)
}

async function prepareOutputDir() {
  await makeDir(OUTPUT_DIR)
}

async function compileSamples() {
  const entries = Object.entries(samples)

  await Promise.all(
    entries
      .filter(([id]) => id !== 'default')
      .map(async ([id, { def }]) => {
        const code = renderNamespaceDefinition(def)
        const file = path.join(OUTPUT_DIR, `${id}.ts`)
        await fs.writeFile(file, code)
        consola.info(chalk`Written: {blue.bold ${file}}`)
      }),
  )
}

export default series(clean, prepareOutputDir, compileSamples)
