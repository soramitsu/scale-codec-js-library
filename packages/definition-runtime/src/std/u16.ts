import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type u16_Decoded = JSBI;

export type u16_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 16,
    signed: false,
    endianness: 'le',
};

export function u16_decode(bytes: Uint8Array): DecodeResult<u16_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function u16_encode(encodable: u16_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
