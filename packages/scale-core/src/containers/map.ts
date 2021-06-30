import { concatUint8Arrays, yieldCycleNTimes } from '@scale-codec/util';
import JSBI from 'jsbi';
import { encodeBigIntCompact, retrieveOffsetAndEncodedLength } from '../compact';
import { decodeIteratively } from './utils';
import { Encode, Decode, DecodeResult } from '../types';

export function encodeMap<K, V>(map: Map<K, V>, KeyEncoder: Encode<K>, ValueEncoder: Encode<V>): Uint8Array {
    const parts = [encodeBigIntCompact(JSBI.BigInt(map.size))];

    for (const [key, value] of map.entries()) {
        parts.push(KeyEncoder(key), ValueEncoder(value));
    }

    return concatUint8Arrays(parts);
}

export function decodeMap<K, V>(
    bytes: Uint8Array,
    KeyDecoder: Decode<K>,
    ValueDecoder: Decode<V>,
): DecodeResult<Map<K, V>> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);

    const decoders = yieldCycleNTimes<Decode<K | V>>([KeyDecoder, ValueDecoder], JSBI.toNumber(length));
    const [decodedKeyValuesSequence, kvDecodedBytes] = decodeIteratively(bytes.subarray(offset), decoders);

    const totalDecodedBytes = offset + kvDecodedBytes;
    const map = new Map<K, V>();

    for (let i = 0; i < decodedKeyValuesSequence.length; i += 2) {
        map.set(decodedKeyValuesSequence[i] as K, decodedKeyValuesSequence[i + 1] as V);
    }

    return [map, totalDecodedBytes];
}
