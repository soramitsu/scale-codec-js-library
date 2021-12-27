import { concatUint8Arrays, yieldNTimes } from '@scale-codec/util'
import { decodeCompact, encodeCompact } from './compact'
import { Decode, DecodeResult, Encode } from '../types'
import { decodeIteratively } from './utils'

export function encodeSet<T>(set: Set<T>, entryEncoder: Encode<T>): Uint8Array {
    return concatUint8Arrays(
        Array.from(set.values()).reduce(
            (parts, entry) => {
                parts.push(entryEncoder(entry))
                return parts
            },
            [encodeCompact(BigInt(set.size))],
        ),
    )
}

export function decodeSet<T>(bytes: Uint8Array, entryDecoder: Decode<T>): DecodeResult<Set<T>> {
    const [size, offset] = decodeCompact(bytes)

    const decoders = yieldNTimes(entryDecoder, Number(size))
    const [entries, decodedBytes] = decodeIteratively(bytes.subarray(offset), decoders)

    return [new Set(entries), offset + decodedBytes]
}
