import { decodeMap, encodeMap } from '@scale-codec/core';
import { NamespaceCodec } from '../types';

export function defMap<N extends {}, K extends keyof N, V extends keyof N>(
    keyRef: K,
    valueRef: V,
): NamespaceCodec<Map<N[K], N[V]>, N> {
    return ({ dynCodec }) => {
        const KeyCodec = dynCodec(keyRef);
        const ValueCodec = dynCodec(valueRef);

        return {
            encode: (map) => encodeMap(map, KeyCodec.encode, ValueCodec.encode),
            decode: (bytes) => decodeMap(bytes, KeyCodec.decode, ValueCodec.decode),
        };
    };
}
