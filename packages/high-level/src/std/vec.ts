import { decodeArrayContainer, encodeArrayContainer } from '@scale-codec/core';
import { ContextSensitiveCodec } from '../types';

// export type Vec<T> = T[];

export function defVec<N, K extends keyof N>(valueRef: K): ContextSensitiveCodec<N[K][], N> {
    return {
        setup({ dynCodec }) {
            const Item = dynCodec(valueRef);
            return {
                encode: (v) => encodeArrayContainer(v, Item.encode),
                decode: (b) => decodeArrayContainer(b, Item.decode),
            };
        },
    };
}
