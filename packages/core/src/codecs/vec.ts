import { concatUint8Arrays } from '@scale-codec/util';
import { Decode, DecodeResult, Encode } from '../types';
import { encodeCompact, decodeCompact } from '../codecs/compact';
import { decodeArray, encodeArray } from './array';

export function decodeVec<T>(bytes: Uint8Array, itemDecoder: Decode<T>): DecodeResult<T[]> {
    const [length, offset] = decodeCompact(bytes);
    const [items, itemsBytes] = decodeArray(bytes.subarray(offset), itemDecoder, Number(length));
    return [items, itemsBytes + offset];
}

export function encodeVec<T>(items: T[], itemEncoder: Encode<T>): Uint8Array {
    return concatUint8Arrays([encodeCompact(BigInt(items.length)), encodeArray(items, itemEncoder, items.length)]);
}

/**
 * Encode `Vec<u8>` directly from the native `Uint8Array`
 */
export function encodeUint8Vec(vec: Uint8Array): Uint8Array {
    return concatUint8Arrays([encodeCompact(BigInt(vec.length)), vec]);
}

/**
 * Decode `Vec<u8>` directly into the native `Uint8Array`
 */
export function decodeUint8Vec(bytes: Uint8Array): DecodeResult<Uint8Array> {
    const [lenBN, offset] = decodeCompact(bytes);
    const len = Number(lenBN);
    return [bytes.slice(offset, offset + len), offset + len];
}
