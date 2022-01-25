import { yieldCycleNTimes } from '@scale-codec/util'
import { decodeCompact, encodeCompact } from './compact'
import { decodeIteratively } from './utils'
import { Encode, Decode, DecodeResult } from '../types'

export function* encodeMap<K, V>(map: Map<K, V>, encodeKey: Encode<K>, encodeValue: Encode<V>): Generator<Uint8Array> {
    yield* encodeCompact(BigInt(map.size))

    for (const [key, value] of map) {
        yield* encodeKey(key)
        yield* encodeValue(value)
    }
}

export function decodeMap<K, V>(
    bytes: Uint8Array,
    decodeKey: Decode<K>,
    decodeValue: Decode<V>,
): DecodeResult<Map<K, V>> {
    const [length, offset] = decodeCompact(bytes)

    const decoders = yieldCycleNTimes<Decode<K | V>>([decodeKey, decodeValue], Number(length))
    const [decodedKeyValuesSequence, kvDecodedBytes] = decodeIteratively(bytes.subarray(offset), decoders)

    const totalDecodedBytes = offset + kvDecodedBytes
    const map = new Map<K, V>()

    for (let i = 0; i < decodedKeyValuesSequence.length; i += 2) {
        map.set(decodedKeyValuesSequence[i] as K, decodedKeyValuesSequence[i + 1] as V)
    }

    return [map, totalDecodedBytes]
}
