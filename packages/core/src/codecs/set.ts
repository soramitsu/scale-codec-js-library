import { concatUint8Arrays, yieldNTimes } from '@scale-codec/util'
import { decodeCompact, encodeCompact } from './compact'
import { Decode, DecodeResult, Encode } from '../types'
import { decodeIteratively } from './utils'

function* encodeSetParts<T>(set: Set<T>, entryEncode: Encode<T>): Generator<Uint8Array> {
    yield encodeCompact(BigInt(set.size))
    for (const item of set) {
        yield entryEncode(item)
    }
}

export function encodeSet<T>(set: Set<T>, entryEncoder: Encode<T>): Uint8Array {
    // const parts: Uint8Array[] = [encodeCompact(BigInt(set.size))]
    // for (const item of set) {
    //     parts.push(entryEncoder(item))
    //     // yield entryEncode(item)
    // }

    return concatUint8Arrays(encodeSetParts(set, entryEncoder))
}

export function decodeSet<T>(bytes: Uint8Array, entryDecoder: Decode<T>): DecodeResult<Set<T>> {
    const [size, offset] = decodeCompact(bytes)

    const decoders = yieldNTimes(entryDecoder, Number(size))
    const [entries, decodedBytes] = decodeIteratively(bytes.subarray(offset), decoders)

    return [new Set(entries), offset + decodedBytes]
}
