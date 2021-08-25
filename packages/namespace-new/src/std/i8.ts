import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type i8_Decoded = JSBI;

export type i8_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 8,
    signed: true,
    endianness: 'le'
};

export const i8_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const i8_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);