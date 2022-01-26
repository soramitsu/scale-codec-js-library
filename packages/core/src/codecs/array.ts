import { assert } from '@scale-codec/util'
import { Decode, Walker, Encode } from '../types'
import { encodeFactory } from '../util'

/**
 * Encodes fixed-length arrays of some items
 */
// eslint-disable-next-line max-params
export function encodeArray<T>(value: T[], encodeItem: Encode<T>, len: number, walker: Walker): void {
    assert(value.length === len, `expected array len: ${len}, actual: ${value.length}`)

    for (const item of value) {
        encodeItem(item, walker)
    }
}

export function createArrayEncoder<T>(encodeItem: Encode<T>, len: number): Encode<T[]> {
    return encodeFactory(
        (arr, walker) => encodeArray(arr, encodeItem, len, walker),
        (arr) => {
            let sum = 0
            for (const item of arr) {
                sum += encodeItem.sizeHint(item)
            }
            return sum
        },
    )
}

/**
 * Decoder opposite to {@link encodeArray}
 */
export function decodeArray<T>(walker: Walker, decodeItem: Decode<T>, len: number): T[] {
    const arr = new Array(len)
    for (let i = 0; i < len; i++) {
        arr[i] = decodeItem(walker)
    }
    return arr
}

export function createArrayDecoder<T>(decodeItem: Decode<T>, len: number): Decode<T[]> {
    return (walker) => decodeArray(walker, decodeItem, len)
}

/**
 * Encode to `[u8; x]` Rust's array directly from the native `Uint8Array`
 */
export function encodeUint8Array(value: Uint8Array, len: number, walker: Walker): void {
    assert(value.length === len, () => `expected exactly ${len} bytes, found: ${value.length}`)
    // copy to prevent unexpected mutations
    walker.arr.set(value, walker.offset)
    walker.offset += value.byteLength
}

export function createUint8ArrayEncoder(len: number): Encode<Uint8Array> {
    return encodeFactory(
        (value, walker) => encodeUint8Array(value, len, walker),
        () => len,
    )
}

/**
 * decode `[u8; x]` array directly into the native `Uint8Array`
 */
export function decodeUint8Array(walker: Walker, len: number): Uint8Array {
    const availableBytesCount = walker.arr.byteLength - walker.offset
    assert(availableBytesCount >= len, () => `expected >= ${len} bytes, found: ${availableBytesCount}`)

    // slice to prevent unexpected source mutations
    const value = walker.arr.slice(walker.offset, walker.offset + len)
    walker.offset += len

    return value
}

export function createUint8ArrayDecoder(len: number): Decode<Uint8Array> {
    return (walker) => decodeUint8Array(walker, len)
}
