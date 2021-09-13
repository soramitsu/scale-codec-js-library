import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type i32_Decoded = JSBI;

export type i32_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 32,
    signed: true,
    endianness: 'le',
};

export function i32_decode(bytes: Uint8Array): DecodeResult<i32_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function i32_encode(encodable: i32_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
