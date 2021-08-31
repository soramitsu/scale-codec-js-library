import path from 'path';
import fs from 'fs/promises';
import prettier from 'prettier';
// @ts-ignore
import prettierConfig from '../../../.prettierrc.js';

const OUT_DIR = path.resolve(__dirname, '../src/std');

function* items(): Generator<[number, boolean]> {
    for (const bits of [8, 16, 32, 64, 128]) {
        for (const signed of [false, true]) {
            yield [bits, signed];
        }
    }
}

function genCodeForInteger(bits: number, signed: boolean): string {
    const ty = `${signed ? 'i' : 'u'}${bits}`;

    // const codec = isBigint ? 'bigintCodec' : 'intCodec';
    // const ty = isBigint ? 'JSBI' : 'number';
    const opts = [`bits: ${bits}`, `signed: ${signed}`, `endianness: 'le'`].map((x) => `    ${x}`).join(',\n');

    const code = [
        `import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';`,
        `export type ${ty}_Decoded = JSBI;`,
        `export type ${ty}_Encodable = JSBI;`,
        `const opts: BigIntCodecOptions = {\n${opts} };`,
        `export function ${ty}_decode(bytes: Uint8Array): DecodeResult<${ty}_Decoded> { return decodeBigInt(bytes, opts) }`,
        `export function ${ty}_encode(encodable: ${ty}_Encodable): Uint8Array { return encodeBigInt(encodable, opts) }`,
    ]
        .filter((x) => !!x)
        .join('\n\n');

    return prettier.format(code, {
        ...prettierConfig,
        parser: 'typescript',
    });
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
