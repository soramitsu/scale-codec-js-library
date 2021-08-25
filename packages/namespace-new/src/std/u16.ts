import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type u16_Decoded = JSBI;

export type u16_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 16,
    signed: false,
    endianness: 'le'
};

export const u16_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const u16_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);