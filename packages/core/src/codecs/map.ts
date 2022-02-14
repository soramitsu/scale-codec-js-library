import { decodeCompact, encodeCompact } from './compact'
import { Encode, Decode, Walker } from '../types'
import { encodeFactory } from '../util'

// eslint-disable-next-line max-params
export function encodeMap<K, V>(map: Map<K, V>, encodeKey: Encode<K>, encodeValue: Encode<V>, walker: Walker): void {
    encodeCompact(map.size, walker)
    for (const kv of map) {
        encodeKey(kv[0], walker)
        encodeValue(kv[1], walker)
    }
}

export function encodeMapSizeHint<K, V>(map: Map<K, V>, encodeKey: Encode<K>, encodeValue: Encode<V>): number {
    let size = encodeCompact.sizeHint(map.size)

    // it is faster to traverse map twice through keys & values separately
    // instead of traversing "entries"
    for (const key of map.keys()) {
        size += encodeKey.sizeHint(key)
    }
    for (const value of map.values()) {
        size += encodeValue.sizeHint(value)
    }

    return size
}

export function decodeMap<K, V>(walker: Walker, decodeKey: Decode<K>, decodeValue: Decode<V>): Map<K, V> {
    let mapSize = Number(decodeCompact(walker))
    const map = new Map<K, V>()
    while (--mapSize >= 0) {
        map.set(decodeKey(walker), decodeValue(walker))
    }
    return map
}

export function createMapEncoder<K, V>(encodeKey: Encode<K>, encodeValue: Encode<V>): Encode<Map<K, V>> {
    return encodeFactory(
        (map, walker) => encodeMap(map, encodeKey, encodeValue, walker),
        (map) => encodeMapSizeHint(map, encodeKey, encodeValue),
    )
}

export function createMapDecoder<K, V>(decodeKey: Decode<K>, decodeValue: Decode<V>): Decode<Map<K, V>> {
    return (walker) => decodeMap(walker, decodeKey, decodeValue)
}
