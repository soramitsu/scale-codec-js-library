import { decodeArrayContainer, encodeArrayContainer } from '@scale-codec/codecs';
import { CodecComplex } from '../types';

export type Vec<T> = T[];

export function defineVecCodec<N, K extends keyof N>(typeName: K): CodecComplex<N[K][], N> {
    return {
        type: 'complex',
        encode: (ns, arr) => {
            const ItemCodec = ns.lookup(typeName);
            return encodeArrayContainer(arr, ItemCodec.encode);
        },
        decode: (ns, buffer) => {
            const ItemCodec = ns.lookup(typeName);
            return decodeArrayContainer(buffer, ItemCodec.decode);
        },
    };
}
