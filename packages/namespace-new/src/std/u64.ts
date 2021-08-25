import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type u64_Decoded = JSBI;

export type u64_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 64,
    signed: false,
    endianness: 'le'
};

export const u64_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const u64_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);