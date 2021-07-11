import { decodeSet, encodeSet } from '@scale-codec/core';
import { NamespaceCodec } from '../types';

export function defSet<N, K extends keyof N>(entryRef: K): NamespaceCodec<Set<N[K]>, N> {
    return {
        setup({ dynCodec }) {
            const { encode, decode } = dynCodec(entryRef);
            return {
                encode: (set) => encodeSet(set, encode),
                decode: (bytes) => decodeSet(bytes, decode),
            };
        },
    };
}
