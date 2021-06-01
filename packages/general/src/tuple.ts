import { CodecType, CompatibleNamespaceTypes } from './types';
import { CodecOptions } from './types';

export class Tuple<V extends any[]> {}

type ArrayValues<T extends any[]> = T extends (infer V)[] ? V : never;

// type M

export function defineTupleCodec<
    N,
    Values extends {
        [x in keyof N]: N[x] extends CodecType<infer V> ? V : never;
    }[keyof N][],
>(types: CompatibleNamespaceTypes<N, ArrayValues<Values>>[]): CodecOptions<N, Tuple<Values>> {
    return {
        decode(root, buff) {
            // unsafe!
            const codecs = types.map((x) => root.lookup(x)) as unknown as Values extends Array<infer V>
                ? CodecType<V>[]
                : never;

            codecs[0].decode(buff.slice(0, 50));

            return new Tuple();
        },
        encode() {
            return new Uint8Array();
        },
    };
}

defineTupleCodec<
    {
        String: CodecType<string>;
        Num: CodecType<number>;
    },
    [string, string, number]
>(['String', 'String', 'Num']);
