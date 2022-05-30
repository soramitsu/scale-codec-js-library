import 'jake'
import { chalk, path } from 'zx'
import fs from 'fs/promises'
import del from 'del'
import consola from 'consola'
import definition from './__definition__'

// doing a typing trick to use actual CommonJS build
// dist/lib.cjs is untyped
import * as compilerLib from '@scale-codec/definition-compiler'
import * as compilerLibCjs from '@scale-codec/definition-compiler/dist/lib.cjs'
const { renderNamespaceDefinition } = compilerLibCjs as typeof compilerLib

const resolve = (...paths: string[]) => path.resolve(__dirname, '../', ...paths)
const NAMESPACE_OUT_FILE = resolve('src/namespace.ts')

task('clean', async () => {
  await del(NAMESPACE_OUT_FILE)
})

task('compile-definition', ['clean'], async () => {
  consola.log('Rendering definition...')
  const code = renderNamespaceDefinition(definition)

  consola.log(chalk`Writing into {bold.blue ${NAMESPACE_OUT_FILE}}...`)
  await fs.writeFile(NAMESPACE_OUT_FILE, code, { encoding: 'utf-8' })
})
