import { concatUint8Arrays, yieldNTimes } from '@scale-codec/util';
import { encodeBigIntCompact, retrieveOffsetAndEncodedLength } from '../compact';
import { Decode, DecodeResult, Encode } from '../types';
import JSBI from 'jsbi';
import { decodeIteratively } from './utils';

export function encodeSet<T>(set: Set<T>, entryEncoder: Encode<T>): Uint8Array {
    const parts = [encodeBigIntCompact(JSBI.BigInt(set.size))];

    for (const entry of set) {
        parts.push(entryEncoder(entry));
    }

    return concatUint8Arrays(parts);
}

export function decodeSet<T>(bytes: Uint8Array, entryDecoder: Decode<T>): DecodeResult<Set<T>> {
    const [offset, size] = retrieveOffsetAndEncodedLength(bytes);

    const decoders = yieldNTimes(entryDecoder, JSBI.toNumber(size));
    const [entries, decodedBytes] = decodeIteratively(bytes.subarray(offset), decoders);

    return [new Set(entries), offset + decodedBytes];
}
