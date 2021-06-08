import { Encode, RustEnum, RustEnumNonEmptyVariants, RustEnumSchema } from '@scale-codec/core';
import { StrKeys, ContextSensitiveCodec, CompatibleNamespaceKeys } from '../types';
import { typedFromEntries, typedToEntries } from '../util';

// type ContextEnumDef<N, V> = {
//     [K in keyof V]: ContextEnumItemDef<V[K], N>;
// };

interface ContextEnumItemDef<Val, N> {
    valueRef: Val extends null ? null : keyof N;
    discriminant: number;
}

/**
 * TODO how to expose `schema` to the world? It has very useful method `create` for creating enums
 * @param def
 */
export function defEnum<V, N>(
    schema: RustEnumSchema<V>,
    dynCodecs: {
        [K in RustEnumNonEmptyVariants<V>]: CompatibleNamespaceKeys<N, V[K]>;
    },
): ContextSensitiveCodec<RustEnum<V>, N> {
    // const schema = new RustEnumSchema(
    //     typedFromEntries(typedToEntries(def).map(([key, { discriminant }]) => [key, { discriminant }])),
    // );

    return {
        // schema,
        setup({ dynCodec }) {
            const codec = schema.enumCodec(
                typedFromEntries(typedToEntries(dynCodecs).map(([k, v]) => [k, dynCodec(v)])) as any,
            );

            return codec;
        },
    };
}

// defineEnum<
//     {
//         Str1: string;
//         Str2: string;
//         Flag: boolean;
//     },
//     {
//         String: string;
//         Bool: boolean;
//     }
// >(
//     new RustEnumSchema({
//         Str: { discriminant: 0 },
//         Flag: { discriminant: 1 },
//     }),
//     {
//         Str: 'String',
//         Flag: 'Bool',
//     },
// );

export interface OptionVariants<T> {
    None: null;
    Some: T;
}

export interface ResultVariants<Ok, Err> {
    Ok: Ok;
    Err: Err;
}

// export type Result<Ok, Err> = Enum<{
//     Ok: Ok;
//     Err: Err;
// }>;
