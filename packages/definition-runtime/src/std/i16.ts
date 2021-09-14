import { encodeBigInt, decodeBigInt, BigIntCodecOptions, DecodeResult, JSBI } from '@scale-codec/core';

export type i16_Decoded = JSBI;

export type i16_Encodable = JSBI;

const opts: BigIntCodecOptions = {
    bits: 16,
    signed: true,
    endianness: 'le',
};

export function i16_decode(bytes: Uint8Array): DecodeResult<i16_Decoded> {
    return decodeBigInt(bytes, opts);
}

export function i16_encode(encodable: i16_Encodable): Uint8Array {
    return encodeBigInt(encodable, opts);
}
