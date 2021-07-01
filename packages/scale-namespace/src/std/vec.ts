import { decodeVec, encodeVec } from '@scale-codec/core';
import { NamespaceCodec } from '../types';

export function defVec<N, K extends keyof N>(itemRef: K): NamespaceCodec<N[K][], N> {
    return {
        setup({ dynCodec }) {
            const { encode, decode } = dynCodec(itemRef);

            return {
                encode: (v) => encodeVec(v, encode),
                decode: (b) => decodeVec(b, decode),
            };
        },
    };
}
