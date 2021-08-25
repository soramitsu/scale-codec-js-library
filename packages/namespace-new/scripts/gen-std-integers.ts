import path from 'path';
import fs from 'fs/promises';

const OUT_DIR = path.resolve(__dirname, '../src/std');
const IMPORT_FROM = '../codecs';

function* items(): Generator<[number, boolean]> {
    for (const bits of [8, 16, 32, 64, 128]) {
        for (const signed of [false, true]) {
            yield [bits, signed];
        }
    }
}

function genCodeForInteger(bits: number, signed: boolean): string {
    const isBigint = bits >= 64;

    const ty = `${signed ? 'i' : 'u'}${bits}`;

    // const codec = isBigint ? 'bigintCodec' : 'intCodec';
    // const ty = isBigint ? 'JSBI' : 'number';
    const opts = [`bits: ${bits}`, `signed: ${signed}`, `endianness: 'le'`].map((x) => `    ${x}`).join(',\n');

    return [
        `import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';\nimport JSBI from 'jsbi';`,
        `export type ${ty}_Decoded = JSBI;`,
        `export type ${ty}_Encodable = JSBI;`,
        `const opts: BigIntCodecOptions = {\n${opts}\n};`,
        `export const ${ty}_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);`,
        `export const ${ty}_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);`,
    ]
        .filter((x) => !!x)
        .join('\n\n');
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
