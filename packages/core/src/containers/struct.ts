import { concatUint8Arrays } from '@scale-codec/util';
import { decodeIteratively } from './utils';
import { Encode, Decode, DecodeResult } from '../types';

export function encodeStruct<T extends {}, C extends { [K in keyof T & string]: Encode<T[K]> }>(
    struct: T,
    encoders: C,
    order: (keyof T & string)[],
): Uint8Array {
    function* parts(): Generator<Uint8Array> {
        for (const field of order) {
            const encoded = encoders[field](struct[field]);
            yield encoded;
        }
    }

    return concatUint8Arrays(parts());
}

export function decodeStruct<T extends {}, C extends { [K in keyof T & string]: Decode<T[K]> }>(
    bytes: Uint8Array,
    decoders: C,
    order: (keyof T & string)[],
): DecodeResult<T> {
    function* decodersIter(): Generator<Decode<unknown>> {
        for (const field of order) {
            yield decoders[field];
        }
    }

    const [values, len] = decodeIteratively(bytes, decodersIter());

    return [Object.fromEntries(order.map((key, i) => [key, values[i]])) as T, len];
}
