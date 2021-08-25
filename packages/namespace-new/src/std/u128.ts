import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type u128_Decoded = JSBI;

export type u128_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 128,
    signed: false,
    endianness: 'le'
};

export const u128_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const u128_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);