import { concatUint8Arrays } from '@scale-codec/util'
import { decodeIteratively } from './utils'
import { Decode, DecodeResult, Encode } from '../types'

export type TupleEncoders<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Encode<Head>, ...TupleEncoders<Tail>]
    : []

export type TupleDecoders<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Decode<Head>, ...TupleDecoders<Tail>]
    : []

export function decodeTuple<T extends any[]>(bytes: Uint8Array, decoders: TupleDecoders<T>): DecodeResult<T> {
    return decodeIteratively(bytes, decoders) as any
}

function* tupleParts(tuple: Array<any>, encoders: Iterable<Encode<any>>): Generator<Uint8Array> {
    let i = 0
    for (const encode of encoders) {
        yield (encode as Encode<any>)(tuple[i++])
    }
}

export function encodeTuple<T extends any[]>(tuple: T, encoders: TupleEncoders<T>): Uint8Array {
    return concatUint8Arrays(tupleParts(tuple, encoders))
}
