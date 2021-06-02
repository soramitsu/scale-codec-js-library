import { CompatibleNamespaceTypes, StrKeys, Codec } from '../types';

export type Enum<V> = EnumMethods<V>;

export type EnumMethods<Variants extends {}> = {
    // is & unwrap may be getters, does not matter, it is an ergonomics question
    is<K extends StrKeys<Variants>>(variantName: K): boolean;
    unwrap<K extends VariantsWithValues<Variants>, Inner extends Variants[K]>(variantName: K): Inner;
    match<R = void>(
        matchMap: {
            [K in StrKeys<Variants>]: Variants[K] extends null ? () => R : (value: Variants[K]) => R;
        },
    ): R;
};

export type EnumConstructor<V extends {}> = {
    create: {
        <K extends VariantsWithValues<V>, Inner extends V[K]>(variant: K, value: Inner): Enum<V>;
        <K extends VariantsWithoutValues<V>>(variant: K): Enum<V>;
    };
};

export type EnumConstructorOpts<V extends {}> = {
    create: {
        <K extends VariantsWithValues<V>, Inner extends V[K]>(variant: K, value: Inner): Enum<V>;
        <K extends VariantsWithoutValues<V>>(variant: K): Enum<V>;
    };
};

export type VariantsWithValues<V extends {}> = {
    [K in StrKeys<V>]: V[K] extends null ? never : K;
}[StrKeys<V>];

// export type AllVariants<V extends {}> = StrKeys<V>;

export type VariantsWithoutValues<V extends {}> = {
    [K in StrKeys<V>]: V[K] extends null ? K : never;
}[StrKeys<V>];

export type EnumVariantsDefinition<N extends {}, Variants extends {}> = {
    [VariantName in StrKeys<Variants>]: Variants[VariantName] extends null
        ? EmptyVariantDefinition<VariantName>
        : NonEmptyVariantDefinition<VariantName, CompatibleNamespaceTypes<N, Variants[VariantName]>>;
}[StrKeys<Variants>][];

export type EmptyVariantDefinition<Name> = Name | [Name] | { name: Name; discriminant: number };

export type NonEmptyVariantDefinition<Name, Type> =
    | [Name, Type]
    | {
          name: Name;
          value: Type;
          discriminant?: number;
      };

export type EnumCodec<N, V> = Codec<N, Enum<V>> & EnumConstructor<V>;

export function defineEnumCodec<N extends {}, V extends {}>(definition: EnumVariantsDefinition<N, V>): EnumCodec<N, V> {
    return {
        encode: () => new Uint8Array(),
        decode: () => null as unknown as Enum<V>,
        create: () => null as any,
    };
}

export type Option<T> = Enum<OptionVariants<T>>;

export type OptionVariants<T> = { None: null; Some: T };

export type Result<Ok, Err> = Enum<{
    Ok: Ok;
    Err: Err;
}>;
