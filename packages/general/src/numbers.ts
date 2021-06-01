import { CodecTypeOptions } from './core';

type CodecNumType = 'signed' | 'unsigned';

export class CodecNumber {
    public constructor(value: number, bits: number, type: CodecNumType) {}

    encode(): Uint8Array {}
}

export function createCodecNumberTypeOptions(bits: number, type: CodecNumType): CodecTypeOptions<any, CodecNumber> {
    return {
        decode: (root, buff) => new CodecNumber(4123, bits, type),
        encode: (root, val) => val.encode(),
    };
}

// creating types

export const u32 = createCodecNumberTypeOptions(32, 'unsigned');

export const i32 = createCodecNumberTypeOptions(32, 'signed');

// const root = createRoot<{
//     u8: CodecNumber;
//     u16: CodecNumber;
//     u32: CodecNumber;
//     i8: CodecNumber;
//     i16: CodecNumber;
//     i32: CodecNumber;
// }>({
//     u8: createCodecNumberTypeOptions(8, 'unsigned'),
//     u16: createCodecNumberTypeOptions(16, 'unsigned'),
//     u32: createCodecNumberTypeOptions(32, 'unsigned'),
//     i8: createCodecNumberTypeOptions(8, 'signed'),
//     i16: createCodecNumberTypeOptions(16, 'signed'),
//     i32: createCodecNumberTypeOptions(32, 'signed'),
// });
