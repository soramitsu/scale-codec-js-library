import fs from 'fs/promises'
import definition from '../../packages/docs/src/snippets/namespace-schema'
import { renderNamespaceDefinition } from '../../packages/docs/node_modules/@scale-codec/definition-compiler/src/lib'
import { DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH as OUTPUT_FILE } from '../meta'

export default async function () {
    const content = renderNamespaceDefinition(definition)
    await fs.writeFile(OUTPUT_FILE, content)
}
