import { decodeBigInt, encodeBigInt, Codec } from '@scale-codec/core';
import JSBI from 'jsbi';

export type SupportedNumberBitLength = 8 | 16 | 32 | 64 | 128;

// FIXME convert to class?
export function defIntUint(bits: SupportedNumberBitLength, signed: boolean): Codec<JSBI> {
    return {
        decode: (buff) => decodeBigInt(buff, { bits, signed, endianness: 'le' }),
        encode: (num) => encodeBigInt(num, { bits, signed, endianness: 'le' }),
    };
}

export const i8 = defIntUint(8, true);
export const i16 = defIntUint(16, true);
export const i32 = defIntUint(32, true);
export const i64 = defIntUint(64, true);
export const i128 = defIntUint(128, true);

export const u8 = defIntUint(8, false);
export const u16 = defIntUint(16, false);
export const u32 = defIntUint(32, false);
export const u64 = defIntUint(64, false);
export const u128 = defIntUint(128, false);
