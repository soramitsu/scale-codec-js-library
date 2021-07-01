import { concatUint8Arrays } from '@scale-codec/util';
import JSBI from 'jsbi';
import { Decode, DecodeResult, Encode } from '../types';
import { retrieveOffsetAndEncodedLength, encodeBigIntCompact } from '../compact';
import { decodeArray, encodeArray } from './array';

export function decodeVec<T>(bytes: Uint8Array, itemDecoder: Decode<T>): DecodeResult<T[]> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);
    const [items, itemsBytes] = decodeArray(bytes.subarray(offset), itemDecoder, JSBI.toNumber(length));
    return [items, itemsBytes + offset];
}

export function encodeVec<T>(items: T[], itemEncoder: Encode<T>): Uint8Array {
    return concatUint8Arrays([
        encodeBigIntCompact(JSBI.BigInt(items.length)),
        encodeArray(items, itemEncoder, items.length),
    ]);
}
