import { Codec } from '../types';
import { decodeBigInt, encodeBigInt } from '@scale-codec/codecs';
import JSBI from 'jsbi';

export type SupportedNumberBitLength = 8 | 16 | 32 | 64;

// FIXME convert to class?
export function NumberCodec(bits: SupportedNumberBitLength, isSigned: boolean): Codec<JSBI> {
    const BYTES_LENGTH = bits / 8;

    return {
        type: 'primitive',
        decode: (buff) => [decodeBigInt(buff, { bits, isSigned }), BYTES_LENGTH],
        encode: (num) => encodeBigInt(num, { bits, isSigned }),
    };
}

export const i8 = NumberCodec(8, false);
export const i16 = NumberCodec(16, false);
export const i32 = NumberCodec(32, false);
export const i64 = NumberCodec(64, false);

export const u8 = NumberCodec(8, true);
export const u16 = NumberCodec(16, true);
export const u32 = NumberCodec(32, true);
export const u64 = NumberCodec(64, true);
