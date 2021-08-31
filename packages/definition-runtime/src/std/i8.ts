import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type i8_Decoded = JSBI;

export type i8_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 8,
    signed: true,
    endianness: 'le',
};

export function i8_decode(bytes: Uint8Array): DecodeResult<i8_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function i8_encode(encodable: i8_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
