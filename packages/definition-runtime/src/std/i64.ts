import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type i64_Decoded = JSBI;

export type i64_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 64,
    signed: true,
    endianness: 'le',
};

export function i64_decode(bytes: Uint8Array): DecodeResult<i64_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function i64_encode(encodable: i64_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
