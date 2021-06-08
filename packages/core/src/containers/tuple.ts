import { concatUint8Arrays } from '@scale-codec/util';
import { decodeIteratively } from './utils';
import { Decode, DecodeResult, Encode } from '../types';

export function decodeTuple<T extends any[]>(
    bytes: Uint8Array,
    decoders: Iterable<Decode<T extends (infer V)[] ? V : never>>,
): DecodeResult<T> {
    return decodeIteratively(bytes, decoders) as any;
}

export function encodeTuple<T extends any[]>(
    tuple: T,
    encoders: Iterable<Encode<T extends (infer V)[] ? V : never>>,
): Uint8Array {
    function* parts(): Generator<Uint8Array> {
        let i = 0;
        for (const encode of encoders) {
            yield encode(tuple[i++]);
        }
    }

    return concatUint8Arrays(parts());
}
