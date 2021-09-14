import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type u128_Decoded = JSBI;

export type u128_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 128,
    signed: false,
    endianness: 'le',
};

export function u128_decode(bytes: Uint8Array): DecodeResult<u128_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function u128_encode(encodable: u128_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
