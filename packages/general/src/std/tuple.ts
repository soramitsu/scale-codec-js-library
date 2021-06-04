import { Codec, CompatibleNamespaceTypes } from '../types';

export class Tuple<V extends any[]> {}

type ArrayValues<T extends any[]> = T extends (infer V)[] ? V : never;

// type M

export function defineTupleCodec<N, Values extends N[keyof N][]>(
    types: CompatibleNamespaceTypes<N, ArrayValues<Values>>[],
): Codec<N, Tuple<Values>> {
    return {
        decode(root, buff) {
            // unsafe!
            const codecs = types.map((x) => root.lookup(x)) as unknown as Values extends Array<infer V>
                ? CodecCompiled<V>[]
                : never;

            codecs[0].decode(buff.slice(0, 50));

            return new Tuple();
        },
        encode() {
            return new Uint8Array();
        },
    };
}

export const EmptyTupleCodec: Codec<any, null> = {
    encode: () => new Uint8Array(),
    decode: () => null,
};

defineTupleCodec<
    {
        String: string;
        Num: number;
    },
    [string, string, number]
>(['String', 'String', 'Num']);
