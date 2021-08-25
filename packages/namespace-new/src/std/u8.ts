import { encodeBigInt, decodeBigInt, BigIntCodecOptions, Encode, Decode } from '@scale-codec/core';
import JSBI from 'jsbi';

export type u8_Decoded = JSBI;

export type u8_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 8,
    signed: false,
    endianness: 'le'
};

export const u8_encode: Encode<JSBI> = (v) => encodeBigInt(v, opts);

export const u8_decode: Decode<JSBI> = (b) => decodeBigInt(b, opts);