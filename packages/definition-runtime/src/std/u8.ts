import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type u8_Decoded = JSBI;

export type u8_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 8,
    signed: false,
    endianness: 'le',
};

export function u8_decode(bytes: Uint8Array): DecodeResult<u8_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function u8_encode(encodable: u8_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
