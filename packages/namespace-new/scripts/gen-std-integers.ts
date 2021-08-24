import path from 'path';
import fs from 'fs/promises';

const OUT_DIR = path.resolve(__dirname, '../src/std');
const IMPORT_FROM = '@scale-codec/namespace-next';

function* items(): Generator<[number, boolean]> {
    for (const bits of [8, 16, 32, 64, 128]) {
        for (const signed of [false, true]) {
            yield [bits, signed];
        }
    }
}

function genCodeForInteger(bits: number, signed: boolean): string {
    const isBigint = bits >= 64;

    const ty = isBigint ? 'JSBI' : 'number';
    const opts = [`bits: ${bits}`, `signed: ${signed}`, `endianness: 'le'`].map((x) => `    ${x}`).join(',\n');

    return [
        `import { ${isBigint ? 'JSBI, bigintCodec' : 'intCodec'} } from '${IMPORT_FROM}';`,
        `export type Pure = ${ty};`,
        `export type Encodable = ${ty};`,
        `export const { encode, decode } = ${isBigint ? 'bigintCodec' : 'intCodec'}({\n${opts}\n})`,
    ].join('\n\n');
}

function genFiles(): { path: string; content: string }[] {
    return Array.from(items(), ([bits, signed]) => {
        const fileName = `${signed ? 'i' : 'u'}${bits}.ts`;
        const filePath = path.join(OUT_DIR, fileName);

        return {
            path: filePath,
            content: genCodeForInteger(bits, signed),
        };
    });
}

async function saveFile({ path, content }: { path: string; content: string }): Promise<void> {
    // console.log('writing into\n%o\ncontent\n%o', path, content);
    await fs.writeFile(path, content, { encoding: 'utf-8' });
}

async function main() {
    await Promise.all(genFiles().map(saveFile));
}

main();
