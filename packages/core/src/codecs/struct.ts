import { concatUint8Arrays } from '@scale-codec/util';
import { decodeIteratively } from './utils';
import { Encode, Decode, DecodeResult } from '../types';

export type StructEncoders<T> = { [K in keyof T & string]: Encode<T[K]> };

export type StructDecoders<T> = { [K in keyof T & string]: Decode<T[K]> };

export function encodeStruct<T extends {}>(
    struct: T,
    encoders: StructEncoders<T>,
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

export function decodeStruct<T extends {}>(
    bytes: Uint8Array,
    decoders: StructDecoders<T>,
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
