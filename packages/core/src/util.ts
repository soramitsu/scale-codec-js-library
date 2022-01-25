import { Decode, DecodeResult } from './types'

export function mapDecodeResult<T, U>([value, len]: DecodeResult<T>, mapFn: (value: T) => U): DecodeResult<U> {
    return [mapFn(value), len]
}

export function decodeAndUnwrap<T>(bytes: Uint8Array, fn: Decode<T>): T {
    const [value, decodedLength] = fn(bytes)
    if (decodedLength !== bytes.byteLength) {
        throw new Error(`Decoded bytes mismatch: (actual) ${decodedLength} vs (expected) ${bytes.length}`)
    }
    return value
}
