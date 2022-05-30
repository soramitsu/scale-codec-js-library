import { $, chalk, path } from 'zx'
import fs from 'fs/promises'
import del from 'del'
import consola from 'consola'
import definition from './__definition__'
import { series } from 'gulp'

// doaing a typing trick to use actual CommonJS build
// dist/lib.cjs is untyped
import * as compilerLib from '@scale-codec/definition-compiler'
import * as compilerLibCjs from '@scale-codec/definition-compiler/dist/lib.cjs'
const { renderNamespaceDefinition } = compilerLibCjs as typeof compilerLib

async function clean() {
  await del('src/namespace.ts')
}

async function compileDefinition() {
  const OUTPUT_PATH = path.resolve(__dirname, 'src/namespace.ts')

  consola.log('Rendering definition...')
  const code = renderNamespaceDefinition(definition)

  consola.log(chalk`Writing into {bold.blue ${OUTPUT_PATH}}...`)
  await fs.writeFile(OUTPUT_PATH, code, { encoding: 'utf-8' })
}

async function typeCheck() {
  await $`pnpm test:types`
}

async function testJest() {
  await $`pnpm test:node`
}

async function testCypress() {
  await $`pnpm test:cy`
}

export const test = series(clean, compileDefinition, typeCheck, testJest, testCypress)
export { compileDefinition, clean }
