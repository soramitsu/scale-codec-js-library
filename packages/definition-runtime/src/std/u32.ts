import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type u32_Decoded = JSBI;

export type u32_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 32,
    signed: false,
    endianness: 'le',
};

export function u32_decode(bytes: Uint8Array): DecodeResult<u32_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function u32_encode(encodable: u32_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
