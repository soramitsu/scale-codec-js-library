import { concatUint8Arrays, decodeArrayWithDecoders } from '@scale-codec/codecs';
import { CodecComplex, CodecPrimitive, CompatibleNamespaceTypes } from '../types';

// export class Tuple<V extends any[]> {}

type ArrayValues<T extends any[]> = T extends (infer V)[] ? V : never;

// type M

function* yieldMappedArray<T, R>(arr: T[], mapFn: (item: T) => R): Generator<R, void> {
    for (const item of arr) {
        yield mapFn(item);
    }
}

export function defineTupleCodec<N, Values extends N[keyof N][]>(
    types: CompatibleNamespaceTypes<N, ArrayValues<Values>>[],
): CodecComplex<Values, N> {
    return {
        type: 'complex',
        encode(ns, values) {
            const encodedValues = values.map((x, i) => {
                const Type = ns.lookup(types[i]);
                return Type.encode(x as any);
            });

            return concatUint8Arrays(...encodedValues);
        },
        decode(ns, bytes) {
            const decoders = yieldMappedArray(types, (key) => ns.lookup(key).decode);

            return decodeArrayWithDecoders(bytes, decoders) as any;
        },
    };
}

export const EmptyTupleCodec: CodecPrimitive<null> = {
    type: 'primitive',
    encode: () => new Uint8Array(),
    decode: () => [null, 0],
};

// defineTupleCodec<
//     {
//         String: string;
//         Num: number;
//     },
//     [string, string, number]
// >(['String', 'String', 'Num']);
