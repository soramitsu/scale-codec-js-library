/* eslint-disable */

import { DecodeResult, EncodeAsIs, decodeTuple, encodeTuple, helperTupleEncoders, str_Decoded, str_Encodable, str_decode, str_encode, u8_Decoded, u8_Encodable, u8_decode, u8_encode } from '@scale-codec/definition-runtime'

// A

export type A_Decoded = B_Decoded

export type A_Encodable = B_Encodable

export function A_decode(bytes: Uint8Array): DecodeResult<A_Decoded> {
    return B_decode(bytes)
}

export function A_encode(encodable: A_Encodable): Uint8Array {
    return B_encode(encodable)
}

// B

export type B_Decoded = str_Decoded

export type B_Encodable = str_Encodable

export function B_decode(bytes: Uint8Array): DecodeResult<B_Decoded> {
    return str_decode(bytes)
}

export function B_encode(encodable: B_Encodable): Uint8Array {
    return str_encode(encodable)
}

// C

export type C_Decoded = [B_Decoded, u8_Decoded]

export type C_Encodable = [B_Encodable | EncodeAsIs, u8_Encodable | EncodeAsIs]

const __hoisted_C_decoders__ = [B_decode, u8_decode]
const __hoisted_C_encoders__ = helperTupleEncoders<C_Decoded>([B_encode, u8_encode])

export function C_decode(bytes: Uint8Array): DecodeResult<C_Decoded> {
    return decodeTuple(bytes, __hoisted_C_decoders__ as any)
}

export function C_encode(encodable: C_Encodable): Uint8Array {
    return encodeTuple(encodable, __hoisted_C_encoders__ as any)
}
