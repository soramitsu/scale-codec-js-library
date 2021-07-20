import { decodeArray, encodeArray } from '@scale-codec/core';
import { NamespaceCodec } from '../types';

export function defArray<N, K extends keyof N>(itemRef: K, len: number): NamespaceCodec<N[K][], N> {
    return {
        setup({ dynCodec }) {
            const { encode, decode } = dynCodec(itemRef);

            return {
                encode: (v) => encodeArray(v, encode, len),
                decode: (b) => decodeArray(b, decode, len),
            };
        },
    };
}
