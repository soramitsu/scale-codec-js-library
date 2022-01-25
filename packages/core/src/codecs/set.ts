import { yieldNTimes } from '@scale-codec/util'
import { decodeCompact, encodeCompact } from './compact'
import { Decode, DecodeResult, Encode } from '../types'
import { decodeIteratively } from './utils'

export function* encodeSet<T>(set: Set<T>, encodeEntry: Encode<T>): Generator<Uint8Array> {
    yield* encodeCompact(BigInt(set.size))
    for (const item of set) {
        yield* encodeEntry(item)
    }
}

export function decodeSet<T>(bytes: Uint8Array, entryDecoder: Decode<T>): DecodeResult<Set<T>> {
    const [size, offset] = decodeCompact(bytes)

    const decoders = yieldNTimes(entryDecoder, Number(size))
    const [entries, decodedBytes] = decodeIteratively(bytes.subarray(offset), decoders)

    return [new Set(entries), offset + decodedBytes]
}
