import { decodeVec, encodeVec } from '@scale-codec/core';
import { ContextSensitiveCodec } from '../types';

export function defVec<N, K extends keyof N>(itemRef: K): ContextSensitiveCodec<N[K][], N> {
    return {
        setup({ dynCodec }) {
            const Item = dynCodec(itemRef);
            return {
                encode: (v) => encodeVec(v, Item.encode),
                decode: (b) => decodeVec(b, Item.decode),
            };
        },
    };
}
