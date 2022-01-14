import { concatUint8Arrays } from '@scale-codec/util'
import { decodeIteratively } from './utils'
import { Encode, Decode, DecodeResult } from '../types'

export type StructEncoders<T> = { [K in keyof T & string]: Encode<T[K]> }

export type StructDecoders<T> = { [K in keyof T & string]: Decode<T[K]> }

function* structEncodeParts<T extends {}>(
    struct: T,
    encoders: StructEncoders<T>,
    order: (keyof T & string)[],
): Generator<Uint8Array> {
    for (const field of order) {
        const encoded = encoders[field](struct[field])
        yield encoded
    }
}

export function encodeStruct<T extends {}>(
    struct: T,
    encoders: StructEncoders<T>,
    order: (keyof T & string)[],
): Uint8Array {
    return concatUint8Arrays(structEncodeParts(struct, encoders, order))
}

function* decodersIter<T extends {}>(
    decoders: StructDecoders<T>,
    order: (keyof T & string)[],
): Generator<Decode<unknown>> {
    for (const field of order) {
        yield decoders[field]
    }
}

export function decodeStruct<T extends {}>(
    bytes: Uint8Array,
    decoders: StructDecoders<T>,
    order: (keyof T & string)[],
): DecodeResult<T> {
    const [values, len] = decodeIteratively(bytes, decodersIter(decoders, order))

    const struct: T = {} as any

    for (let i = 0, len = order.length; i < len; i++) {
        struct[order[i]] = values[i] as any
    }

    return [struct, len]
}
