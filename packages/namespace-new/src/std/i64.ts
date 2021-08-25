import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type i64_Decoded = JSBI;

export type i64_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 64,
    signed: true,
    endianness: 'le'
};

export const i64_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const i64_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);