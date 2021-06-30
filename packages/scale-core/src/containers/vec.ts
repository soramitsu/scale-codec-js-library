import { yieldNTimes, concatUint8Arrays, yieldMapped } from '@scale-codec/util';
import JSBI from 'jsbi';
import { Decode, DecodeResult } from '../types';
import { retrieveOffsetAndEncodedLength, encodeBigIntCompact } from '../compact';
import { decodeIteratively } from './utils';

export function decodeVec<T>(bytes: Uint8Array, arrayItemDecoder: Decode<T>): DecodeResult<T[]> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);
    const iterableDecoders = yieldNTimes(arrayItemDecoder, JSBI.toNumber(length));

    const [decoded, decodedBytes] = decodeIteratively(bytes.subarray(offset), iterableDecoders);

    return [decoded, offset + decodedBytes];
}

export function encodeVec<T>(items: T[], encoder: (item: T) => Uint8Array): Uint8Array {
    return concatUint8Arrays([encodeBigIntCompact(JSBI.BigInt(items.length)), ...yieldMapped(items, encoder)]);
}
