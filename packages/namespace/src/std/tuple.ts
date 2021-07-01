import { encodeTuple, decodeTuple, Encode, Decode, Codec } from '@scale-codec/core';
import { NamespaceCodec, CompatibleNamespaceKeys } from '../types';

// mapping tuple to refs
export type TupleNamespaceRefs<Tuple extends any[], N> = Tuple extends [infer Head, ...infer Tail]
    ? [CompatibleNamespaceKeys<N, Head>, ...TupleNamespaceRefs<Tail, N>]
    : [];

export function defTuple<N, T extends any[]>(refs: TupleNamespaceRefs<T, N>): NamespaceCodec<T, N> {
    return {
        setup({ dynCodec }) {
            const scaleEncoders: Encode<any>[] = [];
            const scaleDecoders: Decode<any>[] = [];

            for (const ref of refs) {
                const { encode, decode } = dynCodec(ref);

                scaleEncoders.push(encode);
                scaleDecoders.push(decode);
            }

            const scale: Codec<any> = {
                encode: (v) => encodeTuple(v, scaleEncoders as any),
                decode: (b) => decodeTuple(b, scaleDecoders as any),
            };

            return scale;
        },
    };
}
