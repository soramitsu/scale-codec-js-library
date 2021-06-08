import { encodeTuple, decodeTuple, Encode } from '@scale-codec/core';
import { ContextSensitiveCodec, CompatibleNamespaceKeys } from '../types';

type ArrayValues<T extends any[]> = T extends (infer V)[] ? V : never;

export function defTuple<N, Values extends N[keyof N][]>(
    types: CompatibleNamespaceKeys<N, ArrayValues<Values>>[],
): ContextSensitiveCodec<Values, N> {
    return {
        setup({ dynCodec }) {
            const Types = types.map((name) => dynCodec(name));
            const encoders = Types.map((x) => x.encode);
            const decoders = Types.map((x) => x.decode);

            return {
                encode: (v) => encodeTuple(v, encoders as any[]),
                decode: (b) => decodeTuple(b, decoders as any[]),
            };
        },
    };
}
