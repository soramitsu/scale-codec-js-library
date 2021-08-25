import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type i32_Decoded = JSBI;

export type i32_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 32,
    signed: true,
    endianness: 'le'
};

export const i32_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const i32_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);