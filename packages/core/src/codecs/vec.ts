import { Decode, Walker, Encode } from '../types'
import { encodeCompact, decodeCompact } from '../codecs/compact'
import { decodeArray } from './array'
import { encodeFactory } from '../util'

export function encodeVec<T>(vec: T[], encodeItem: Encode<T>, walker: Walker): void {
    encodeCompact(BigInt(vec.length), walker)
    for (const item of vec) {
        encodeItem(item, walker)
    }
}

export function encodeVecSizeHint<T>(vec: T[], encodeItem: Encode<T>): number {
    let size = encodeCompact.sizeHint(vec.length)
    for (const item of vec) {
        size += encodeItem.sizeHint(item)
    }
    return size
}

export function createVecEncoder<T>(encodeItem: Encode<T>): Encode<T[]> {
    return encodeFactory(
        (vec, walker) => encodeVec(vec, encodeItem, walker),
        (vec) => encodeVecSizeHint(vec, encodeItem),
    )
}

export function decodeVec<T>(walker: Walker, decodeItem: Decode<T>): T[] {
    const vecLength = decodeCompact(walker)
    return decodeArray(walker, decodeItem, Number(vecLength))
}

export function createVecDecoder<T>(decodeItem: Decode<T>): Decode<T[]> {
    return (walker) => decodeVec(walker, decodeItem)
}

export const encodeUint8Vec: Encode<Uint8Array> = encodeFactory(
    (vec, walker) => {
        encodeCompact(vec.byteLength, walker)
        walker.arr.set(vec, walker.offset)
        walker.offset += vec.byteLength
    },
    (vec) => encodeCompact.sizeHint(vec.length) + vec.byteLength,
)

export const decodeUint8Vec: Decode<Uint8Array> = (walker) => {
    const len = Number(decodeCompact(walker))
    const vec = walker.arr.slice(walker.offset, walker.offset + len)
    walker.offset += len
    return vec
}
