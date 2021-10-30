import { Decode, DecodeResult } from '../types';

export function decodeIteratively<T>(bytes: Uint8Array, decoders: Iterable<Decode<T>>): DecodeResult<T[]> {
    const decoded: T[] = [];
    let totalDecodedBytes = 0;

    for (const decode of decoders) {
        const [item, decodedLen] = decode(bytes.subarray(totalDecodedBytes));
        decoded.push(item);
        totalDecodedBytes += decodedLen;
    }

    return [decoded, totalDecodedBytes];
}
