import { assert, concatUint8Arrays, yieldMapped, yieldNTimes } from '@scale-codec/util'
import { Decode, DecodeResult, Encode } from '../types'
import { decodeIteratively } from './utils'

/**
 * Encodes fixed-length arrays of some items
 */
export function encodeArray<T>(items: T[], itemEncoder: Encode<T>, len: number): Uint8Array {
    assert(items.length === len, `expected array len: ${len}; found: ${items.length}`)
    return concatUint8Arrays(yieldMapped(items, itemEncoder))
}

/**
 * Decoder opposite to {@link encodeArray}
 */
export function decodeArray<T>(bytes: Uint8Array, itemDecoder: Decode<T>, len: number): DecodeResult<T[]> {
    return decodeIteratively(bytes, yieldNTimes(itemDecoder, len))
}

/**
 * Encode to `[u8; x]` Rust's array directly from the native `Uint8Array`
 */
export function encodeUint8Array(bytes: Uint8Array, len: number): Uint8Array {
    assert(bytes.length === len, () => `expected exactly ${len} bytes, found: ${bytes.length}`)
    // copy to prevent unexpected mutations
    return bytes.slice()
}

/**
 * decode `[u8; x]` array directly into the native `Uint8Array`
 */
export function decodeUint8Array(bytes: Uint8Array, len: number): DecodeResult<Uint8Array> {
    assert(bytes.length >= len, () => `expected >= ${len} bytes, found: ${bytes.length}`)
    return [
        // slice to prevent unexpected source mutations
        bytes.slice(0, len),
        len,
    ]
}
