// export function* encodeBytesIter(bytes: Uint8Array): Generator<Uint8Array, void, number> {
//     let offset = 0;
//     while (offset < bytes.length) {
//         const subarr = bytes.subarray(offset);
//         const bytesEncoded = yield subarr;
//         offset += bytesEncoded;
//     }
// }

import JSBI from 'jsbi';
import { encodeBigIntCompact, retrieveOffsetAndEncodedLength } from './compact';
import { concatUint8Arrays, yieldMapped, yieldNTimes } from '@scale-codec/util';

export type DecodersGenerator<T> = Generator<(bytes: Uint8Array) => [T, number], void>;

export type Decoder<T> = (bytes: Uint8Array) => [T, number];

type Encoder<T> = (value: T) => Uint8Array;

export function decodeIteratively<T>(bytes: Uint8Array, decoders: Iterable<Decoder<T>>): [T[], number] {
    const decoded: T[] = [];
    let totalDecodedBytes = 0;

    for (const decode of decoders) {
        const [item, decodedLen] = decode(bytes.subarray(totalDecodedBytes));
        // console.log('Decoded %o to %o (len - %o)', [...bytes.subarray(totalDecodedBytes)], item, decodedLen);
        decoded.push(item);
        totalDecodedBytes += decodedLen;
    }

    return [decoded, totalDecodedBytes];
}

// function* yieldMappedAppropriately

export function decodeArrayContainer<T>(bytes: Uint8Array, arrayItemDecoder: Decoder<T>): [T[], number] {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);
    const iterableDecoders = yieldNTimes(arrayItemDecoder, JSBI.toNumber(length));

    const [decoded, decodedBytes] = decodeIteratively(bytes.subarray(offset), iterableDecoders);

    return [decoded, offset + decodedBytes];
}

export function encodeArrayContainer<T>(items: T[], encoder: (item: T) => Uint8Array): Uint8Array {
    return concatUint8Arrays([encodeBigIntCompact(JSBI.BigInt(items.length)), ...yieldMapped(items, encoder)]);
}

export function decodeTuple<T extends any[]>(
    bytes: Uint8Array,
    decoders: Iterable<Decoder<T extends (infer V)[] ? V : never>>,
): [T, number] {
    return decodeIteratively(bytes, decoders) as any;
}

export function encodeTuple<T extends any[]>(
    tuple: T,
    encoders: Iterable<Encoder<T extends (infer V)[] ? V : never>>,
): Uint8Array {
    function* gen(): Generator<Uint8Array> {
        let i = 0;
        for (const encode of encoders) {
            yield encode(tuple[i++]);
        }
    }

    return concatUint8Arrays(gen());
}
