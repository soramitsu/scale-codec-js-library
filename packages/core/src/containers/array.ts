import { assert, concatUint8Arrays, yieldMapped, yieldNTimes } from '@scale-codec/util';
import { Decode, DecodeResult, Encode } from '../types';
import { decodeIteratively } from './utils';

export function encodeArray<T>(items: T[], itemEncoder: Encode<T>, len: number): Uint8Array {
    assert(items.length === len, `expected array len: ${len}; found: ${items.length}`);
    return concatUint8Arrays(yieldMapped(items, itemEncoder));
}

export function decodeArray<T>(bytes: Uint8Array, itemDecoder: Decode<T>, len: number): DecodeResult<T[]> {
    return decodeIteratively(bytes, yieldNTimes(itemDecoder, len));
}
