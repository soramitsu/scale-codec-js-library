import { generate } from '@scale-codec/namespace-codegen';
import def from './def';
import fs from 'fs/promises';
import path from 'path';

(async function () {
    const code = generate(def, {
        namespaceTypeName: 'Namespace',
        namespaceValueName: 'e2eNamespace',
        importLib: '@scale-codec/namespace',
    });

    await fs.writeFile(path.join(__dirname, 'ns.ts'), code);
})().catch((err) => {
    console.error('Generation failed', err);
    process.exit(1);
});
