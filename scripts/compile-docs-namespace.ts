import { path } from 'zx';
import fs from 'fs/promises';
import definition from '../packages/docs/root/lib/snippets/namespace-schema';
import { renderNamespaceDefinition } from '../packages/docs/node_modules/@scale-codec/definition-compiler/src/lib';

const OUTPUT_FILE = path.resolve(__dirname, '../packages/docs/root/lib/snippets/namespace-schema-compiled.ts');

export default async function () {
    const content = renderNamespaceDefinition(definition);
    await fs.writeFile(OUTPUT_FILE, content);
}
