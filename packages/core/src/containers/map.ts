import { concatUint8Arrays, yieldCycleNTimes } from '@scale-codec/util';
import JSBI from 'jsbi';
import { decodeCompact, encodeCompact } from '../compact';
import { decodeIteratively } from './utils';
import { Encode, Decode, DecodeResult } from '../types';

export function encodeMap<K, V>(map: Map<K, V>, KeyEncoder: Encode<K>, ValueEncoder: Encode<V>): Uint8Array {
    return concatUint8Arrays(
        Array.from(map).reduce<Uint8Array[]>(
            (parts, [key, value]) => {
                parts.push(KeyEncoder(key), ValueEncoder(value));
                return parts;
            },
            [encodeCompact(JSBI.BigInt(map.size))],
        ),
    );
}

export function decodeMap<K, V>(
    bytes: Uint8Array,
    KeyDecoder: Decode<K>,
    ValueDecoder: Decode<V>,
): DecodeResult<Map<K, V>> {
    const [length, offset] = decodeCompact(bytes);

    const decoders = yieldCycleNTimes<Decode<K | V>>([KeyDecoder, ValueDecoder], JSBI.toNumber(length));
    const [decodedKeyValuesSequence, kvDecodedBytes] = decodeIteratively(bytes.subarray(offset), decoders);

    const totalDecodedBytes = offset + kvDecodedBytes;
    const map = new Map<K, V>();

    for (let i = 0; i < decodedKeyValuesSequence.length; i += 2) {
        map.set(decodedKeyValuesSequence[i] as K, decodedKeyValuesSequence[i + 1] as V);
    }

    return [map, totalDecodedBytes];
}
