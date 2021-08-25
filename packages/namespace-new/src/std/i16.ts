import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type i16_Decoded = JSBI;

export type i16_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 16,
    signed: true,
    endianness: 'le'
};

export const i16_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const i16_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);