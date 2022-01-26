import { Encode, Decode, Walker } from '../types'
import { encodeFactory } from '../util'

export type StructEncoders<T> = { [K in keyof T]: [K, Encode<T[K]>] }[keyof T][]

export type StructDecoders<T> = { [K in keyof T]: [K, Decode<T[K]>] }[keyof T][]

export function encodeStruct<T extends {}>(struct: T, encoders: StructEncoders<T>, walker: Walker): void {
    for (const [key, encode] of encoders) {
        encode(struct[key], walker)
    }
}

export function encodeStructSizeHint<T extends {}>(struct: T, encoders: StructEncoders<T>): number {
    let sum = 0
    for (const [key, encode] of encoders) {
        sum += encode.sizeHint(struct[key])
    }
    return sum
}

export function createStructEncoder<T extends {}>(encoders: StructEncoders<T>): Encode<T> {
    return encodeFactory(
        (val, walker) => encodeStruct(val, encoders, walker),
        (val) => encodeStructSizeHint(val, encoders),
    )
}

export function decodeStruct<T extends {}>(walker: Walker, decoders: StructDecoders<T>): T {
    const struct: T = {} as any
    for (const [key, decode] of decoders) {
        struct[key] = decode(walker)
    }
    return struct
}

export function createStructDecoder<T extends {}>(decoders: StructDecoders<T>): Decode<T> {
    return (walker) => decodeStruct(walker, decoders)
}
