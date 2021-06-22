import { decodeMap, encodeMap } from '@scale-codec/core';
import { ContextSensitiveCodec } from '../types';

export function defMap<N extends {}, K extends keyof N, V extends keyof N>(
    keyRef: K,
    valueRef: V,
): ContextSensitiveCodec<Map<N[K], N[V]>, N> {
    return {
        setup({ dynCodec }) {
            const KeyCodec = dynCodec(keyRef);
            const ValueCodec = dynCodec(valueRef);

            return {
                encode: (map) => encodeMap(map, KeyCodec.encode, ValueCodec.encode),
                decode: (bytes) => decodeMap(bytes, KeyCodec.decode, ValueCodec.decode),
            };
        },
    };
}
