import { Codec, bigIntCodec, AllowedBits } from '@scale-codec/core';
import JSBI from 'jsbi';

function codec(bits: AllowedBits, signed: boolean): Codec<JSBI> {
    return bigIntCodec({ bits, signed, endianness: 'le' });
}

export const i8 = codec(8, true);
export const i16 = codec(16, true);
export const i32 = codec(32, true);
export const i64 = codec(64, true);
export const i128 = codec(128, true);
export const u8 = codec(8, false);
export const u16 = codec(16, false);
export const u32 = codec(32, false);
export const u64 = codec(64, false);
export const u128 = codec(128, false);
