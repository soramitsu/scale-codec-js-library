import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type u32_Decoded = JSBI;

export type u32_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 32,
    signed: false,
    endianness: 'le'
};

export const u32_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const u32_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);