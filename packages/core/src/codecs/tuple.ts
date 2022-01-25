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

export function* encodeTuple<T extends any[]>(tuple: T, encoders: TupleEncoders<T>): Generator<Uint8Array> {
    let i = 0
    for (const encode of encoders) {
        yield* (encode as Encode<any>)(tuple[i++])
    }
}
