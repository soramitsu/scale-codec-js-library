import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type u64_Decoded = JSBI;

export type u64_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 64,
    signed: false,
    endianness: 'le',
};

export function u64_decode(bytes: Uint8Array): DecodeResult<u64_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function u64_encode(encodable: u64_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
