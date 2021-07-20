import { generate } from '@scale-codec/namespace-codegen';
import def from '../src/namespace/def';
import fs from 'fs/promises';
import path from 'path';

(async function () {
    const code = generate(def, {
        namespaceTypeName: 'Namespace',
        namespaceValueName: 'types',
        importLib: '@scale-codec/namespace',
    });

    await fs.writeFile(path.join(__dirname, '../src/namespace/index.ts'), code);
})().catch((err) => {
    console.error('Generation failed', err);
    process.exit(1);
});
