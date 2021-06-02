import { Codec } from '../types';

export type SupportedNumberBitLength = 8 | 16 | 32 | 64 | 128 | 256;

// FIXME convert to class
export function NumberCodec(bits: SupportedNumberBitLength, signed: boolean): Codec<any, number> {
    return {
        decode: (ns, buff) => 0,
        encode: (ns, num) => new Uint8Array(),
    };
}

export const i8 = NumberCodec(8, false);

export const u8 = NumberCodec(8, true);

// export class CodecNumber<Signed extends boolean, Bits extends SupportedNumberBitLength> {
//     public static with<B extends SupportedNumberBitLength, S extends boolean>(bits: B, isSigned: S) {
//         return class extends CodecNumber<S, B> {
//             constructor()
//         }
//     }

//     public constructor(value: number, bits: number, type: CodecNumType) {}

//     encode(): Uint8Array {}
// }

// export function defineNumCodec(bits: number, type: CodecNumType): Codec<any, CodecNumber> {
//     return {
//         decode: (root, buff) => new CodecNumber(4123, bits, type),
//         encode: (root, val) => val.encode(),
//     };
// }

// // creating types

// export const u32 = defineNumCodec(32, 'unsigned');

// export const i32 = defineNumCodec(32, 'signed');

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
