import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type i128_Decoded = JSBI;

export type i128_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 128,
    signed: true,
    endianness: 'le',
};

export function i128_decode(bytes: Uint8Array): DecodeResult<i128_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function i128_encode(encodable: i128_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
