// import { ScaleEncoder, ScaleDecoder } from './core';
// import { ScaleString, ScaleStringDecoder } from './string';

import { CodecTypeOptions, createRoot } from './core';

// type EnumInstance<V extends {}> = {
//     encode(): Uint8Array;
// } & EnumMethods<V>;

// type EnumDecoder<V extends {}> = ScaleDecoder<Enum<V>>;

type EnumConstructor<V extends {}> = {
    create: {
        <K extends VariantsWithValues<V>, Inner extends V[K]>(variant: K, value: Inner): Enum<V>;
        <K extends VariantsWithoutValues<V>>(variant: K): Enum<V>;
    };
};

// type ExposeEnumVariants<V extends {}> = {
//     [K in keyof V & string as `is${K}`]: boolean;
// } &
//     {
//         [K in keyof V & string as `unwrap${K}`]: () => V[K] extends null ? never : V[K];
//     };

/**
 * Удобные функции для работы с енамами
 */
type EnumMethods<Variants extends {}> = {
    // is & unwrap may be getters, does not matter, it is an ergonomics question
    is<K extends StrKeys<Variants>>(variantName: K): boolean;
    unwrap<K extends VariantsWithValues<Variants>, Inner extends Variants[K]>(variantName: K): Inner;
    match<R = void>(
        matchMap: {
            [K in StrKeys<Variants>]: Variants[K] extends null ? () => R : (value: Variants[K]) => R;
        },
    ): R;
};

type VariantsWithValues<V extends {}> = {
    [K in StrKeys<V>]: V[K] extends null ? never : K;
}[StrKeys<V>];

type AllVariants<V extends {}> = StrKeys<V>;

type VariantsWithoutValues<V extends {}> = {
    [K in StrKeys<V>]: V[K] extends null ? K : never;
}[StrKeys<V>];

type VariantsValues<V extends {}> = {
    [K in StrKeys<V>]: V[K];
}[StrKeys<V>];

// methods testing
{
    const option: EnumMethods<{
        None: null;
        Some: String;
    }> = {} as any;

    const val = option.match({
        None: () => 0,
        Some: (val) => Number(val),
    });
}

// interface EnumVariants

// interface TestVariants<T> {
//     None: null;
//     Some: T;
// }

type EnumVariantsDefinition<N extends {}, Variants extends {}> = {
    [VariantName in StrKeys<Variants>]: Variants[VariantName] extends null
        ? VariantName | [VariantName] | { name: VariantName; discriminant: number }
        : Variants[VariantName] extends keyof N
        ?
              | [VariantName, Variants[VariantName]]
              | { name: VariantName; discriminant: number; value: Variants[VariantName] }
        : never;
}[StrKeys<Variants>][];

function createEnumCodec<N extends {}, V extends {}>(definition: EnumVariantsDefinition<N, V>): EnumCodecOptions<N, V> {
    return {
        encode: () => new Uint8Array(),
        decode: () => null as Enum<V>,
        create: () => null as Enum<V>,
    };
}

type EnumCodecOptions<N, V> = CodecTypeOptions<N, Enum<V>> & EnumConstructor<V>;

type NSWithEnum = {
    'Option<String>': EnumCodecOptions<{}, Enum<{ None: null; Some: string }>>;
};

const root = createRoot<NSWithEnum>({} as any);

const OptStrType = root.lookup('Option<String>');

OptStrType.encode();

// type EnumVarDef<T> = T extends null ? EnumVariantDefEmpty : T extends ScaleEncoder ? EnumVariantDefValued<T> : 'wat';

// type EnumVariantDefinition<N extends string, T extends SomeCodecType> =
//     | N // empty enum variant
//     | [N] // empty variant as tuple
//     | [N, T] // non-empty variant
//     | {
//           // strictly defined variant
//           name: N;
//           value?: null | T;
//       };

// type EnumVariantDefEmpty = null | {
//     //   name: N;
//     discriminant: number;
// };

// type EnumVariantDefValued<T extends ScaleEncoder> =
//     | ScaleDecoder<T>
//     | {
//           //   name: N;
//           value: ScaleDecoder<T>;
//           discriminant?: number;
//       };

// type tValued = EnumVariantsDefinition<{
//     Some: ScaleString;
// }>;

// const def: tValued = {
//     Some: ScaleStringDecoder,
// };

// type ImplicitDiscriminantsDefinition<T extends {}> = (
//     | EnumVariantDefEmpty<K>
//     | (T[K] extends SomeCodecType ? EnumVariantDefValued<K, T[K]> : never)
// )[];

// type ImplicitDiscriminantsDefinition<T extends {}> = {
//     [K in StrKeys<T>]: T[K] extends null
//         ? EnumVariantDefEmpty<K>
//         : T[K] extends SomeCodecType
//         ? EnumVariantDefValued<K, T[K]>
//         : never;
// }[StrKeys<T>][];
// // type ExplicitDiscriminantsDefinition<T extends {}> = MapValuesToNumIndexes<{
// //     [K in StrKeys<T>]: T[K] extends null
// //         ? EnumVariantDefEmpty<K>
// //         : T[K] extends SomeCodecType
// //         ? EnumVariantDefValued<K, T[K]>
// //         : never;
// // }>;

// type MapValuesToNumIndexes<T extends {}, K extends StrKeys<T> = StrKeys<T>> = {
//     [I in number]: T[K];
// };

// type AAA = EnumVariantsDefinition<OptionEnumVariants<SomeCodecType>>;

interface OptionEnumVariants<T extends ScaleEncoder> {
    None: null;
    Some: T;
}

// function extractDefs<T extends {}>(v: EnumVariantsDefinition<T>): T {
//     return null as any;
// }

// const a = extractDefs<OptionEnumVariants<SomeCodecType & { bar: 'string' }>>({
//     None: null,
//     Some: {
//         value: { foo: 'bar', bar: 'string' },
//         discriminant: 9,
//     },
// });

// type ToEntries<T> = {
//     [K in keyof T]: [K, T[K]];
// }[keyof T];

type StrKeys<T> = keyof T & string;

// type NormalizedVariantsDefinition<D extends EnumVariantDefinition> =
//     D extends ImplicitDiscriminantsDefinition

// type EnumVariantNormalized = EnumVariantNormalizedEmpty | EnumVariantNormalizedValued<;

// type EnumVariantNormalizedEmpty = {
//     name: string;
//     discriminant: number;
//     value: null;
// };

// type EnumVariantNormalizedValued<T> = {
//     name: string;
//     discriminant: number;
//     value: T;
// };

// type SomeCodecType = { foo: 'bar' };

type Enum<V extends {}> = EnumMethods<V> & {};

function createEnum<V extends {}>(variants: EnumVariantsDefinition<V>): EnumConstructableAndDecodable<V> {
    // some magic

    return {
        // question: separate or not decoding from other creation methods?
        decode: () => new Enum(),
        create: (...args: unknown[]) => {
            return new Enum<V>();
        },
    };
}

type EnumConstructableAndDecodable<V extends {}> = EnumDecoder<V> & EnumConstructor<V>;

export class Option {
    public static with<T extends ScaleEncoder>(
        SomeDecoder: ScaleDecoder<T>,
    ): EnumConstructableAndDecodable<OptionEnumVariants<T>> {
        const a = createEnum<{
            None: null;
            Some: ScaleString;
        }>({
            None: null,
            Some: ScaleStringDecoder,
        });

        return createEnum<OptionEnumVariants<T>>({
            None: null,
            Some: ScaleStringDecoder,
        });
    }
}

interface ResultEnumVariants<Ok extends ScaleEncoder, Err extends ScaleEncoder> {
    Ok: Ok;
    Err: Err;
}

export class Result {
    public static with<Ok extends ScaleEncoder, Err extends ScaleEncoder>(
        OkVariant: Ok,
        ErrVariant: Err,
    ): EnumConstructableAndDecodable<ResultEnumVariants<Ok, Err>> {
        return createEnum({
            Ok: OkVariant,
            Err: ErrVariant,
        });
    }
}

// export const Option = createEnum<OptionEnumVariants<TextCodec>>({
//     None: null,
//     Some: {
//         value: ScaleStringDecoder,
//         discriminant: 9,
//     },
// });

// testing construction and encoding
{
    // type TextCodec = SomeCodecType;

    const maybe = Option.with(ScaleStringDecoder).create('None');

    maybe.unwrap('Some');
    // Option.create('None');
    const decoded = Option.decode(new Uint8Array());

    maybe.is('None');

    decoded.encode();
}

// // ----------------

// type OptionDef = EnumVariantsDefinition<{
//     Option: null;
//     Some: boolean;
// }>;

// function test<T>(def: EnumVariantsDefinition<T>);

// const SomeCodec: SomeCodecType = null;

// test({
//     0: 'None',
//     1: ['Some', SomeCodec],
// });

// type TestInstance = EnumInstance<TestVariants<boolean>>;

// // function defineEnum(variants: EnumVariantsDefinition) {}
