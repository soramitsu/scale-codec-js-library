import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type i128_Decoded = JSBI;

export type i128_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 128,
    signed: true,
    endianness: 'le'
};

export const i128_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const i128_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);