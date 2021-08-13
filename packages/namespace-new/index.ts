/* eslint-disable @typescript-eslint/no-namespace */

import { Codec, Decode, Encode, Enum, GetValuableVariantValue, Valuable, ValuableVariants } from '@scale-codec/core';

const EncodeSkipBrand = Symbol('asd');

type EncodeSkippable = {
    [EncodeSkipBrand]: true;
    readonly bytes: Uint8Array;
};

function skipEncoding(bytes: Uint8Array): EncodeSkippable {
    return {
        [EncodeSkipBrand]: true,
        bytes,
    };
}

type GetDecodedFromNamespace<N, K extends keyof N> = N[K] extends NamespaceTypeSchema<infer Decoded, any>
    ? Decoded
    : never;

type DynCodecFn<N> = <K extends keyof N>(
    ref: K,
) => Codec<
    // here not N[K], but some extractor
    GetDecodedFromNamespace<N, K>
>;

type NamespaceCodecSetupFn<Decoded, Encodable, N> = (ctx: { dynCodec: DynCodecFn<N> }) => Codec<Decoded, Encodable>;

type NamespaceCodec<Decoded, Encodable, N> = Codec<Decoded, Encodable> | NamespaceCodecSetupFn<Decoded, Encodable, N>;

type NamespaceTypeSchema<Decoded, Encodable> = {
    decoded: Decoded;
    // codec: NamespaceCodec<Decoded, Encodable, N>;
    encodable: Encodable;
};

type StructEncodable<T> = {
    [K in keyof T]: T[K] | EncodeSkippable;
};

type EnumDefEncodable<Def> = {
    [K in keyof Def]: Def[K] extends Valuable<infer V> ? Valuable<V | EncodeSkippable> : Def[K];
};

// type EnumEncodable<Def, K extends ValuableVariants<Def>> = GetValuableVariantValue<Def[K]> | EncodeSkippable;

type GetEncodableFromNamespace<N, K extends keyof N> = N[K] extends NamespaceTypeSchema<any, infer Encodable>
    ? Encodable
    : never;

type NamespaceEncodeFn<N> = <K extends keyof N>(ref: K, val: GetEncodableFromNamespace<N, K>) => Uint8Array;

type NamespaceDecodeFn<N> = <K extends keyof N>(ref: K, bytes: Uint8Array) => GetDecodedFromNamespace<N, K>;

type NamespaceCompiled<N> = {
    encode: NamespaceEncodeFn<N>;
    decode: NamespaceDecodeFn<N>;
};

type NamespaceSchema<N> = {
    [K in keyof N]: N[K] extends NamespaceTypeSchema<infer Decoded, infer Encodable>
        ? NamespaceCodec<Decoded, Encodable, N>
        : never;
};

function defNamespace<N>(schema: NamespaceSchema<N>): NamespaceCompiled<N> {
    return null as any; // stub
}

type StructTypeSchema<T> = NamespaceTypeSchema<T, StructEncodable<T>>;

type EnumTypeSchema<Def> = NamespaceTypeSchema<Enum<Def>, Enum<EnumDefEncodable<Def>>>;

type MapTypeSchema<K, V> = NamespaceTypeSchema<Map<K, V>, Map<K | EncodeSkippable, V | EncodeSkippable>>;

{
    type MyModel = {
        str: NamespaceTypeSchema<string, string>;
        u8: NamespaceTypeSchema<number, number>;
        Person: StructTypeSchema<{
            name: GetDecodedFromNamespace<MyModel, 'str'>;
            age: GetDecodedFromNamespace<MyModel, 'u8'>;
        }>;
        Event: EnumTypeSchema<{
            Received: null;
            Message: Valuable<GetDecodedFromNamespace<MyModel, 'str'>>;
        }>;
        'Map<u8, Event>': MapTypeSchema<
            GetDecodedFromNamespace<MyModel, 'u8'>,
            GetDecodedFromNamespace<MyModel, 'Event'>
        >;
    };

    const ns = defNamespace<MyModel>(null as any);
    const SKIP = skipEncoding(new Uint8Array([12, 4, 0, 1]));

    ns.encode('u8', 12);
    // ns.encode('u8', SKIP);

    ns.encode('str', '4123');
    // ns.encode('str', SKIP);

    ns.encode('Person', {
        name: '412',
        age: SKIP,
    });

    ns.encode('Event', Enum.create('Received'));
    ns.encode('Event', Enum.create('Message', 'asd'));
    ns.encode('Event', Enum.create('Message', SKIP));

    ns.encode(
        'Map<u8, Event>',
        new Map([
            [0, Enum.create('Received')],
            [2, SKIP],
        ]),
    );
}

// {
namespace MyModel {
    export namespace str {
        export type Decoded = string;

        export type Encodable = string;

        export function encode(val: Encodable): Uint8Array {}

        export function decode(bytes: Uint8Array): Decoded {}
    }

    export namespace u8 {
        export type Decoded = number;
        export type Encodable = number;

        export function encode(val: Encodable): Uint8Array {}

        export function decode(bytes: Uint8Array): Decoded {}
    }

    export namespace Person {
        export type Decoded = {
            name: MyModel.str.Decoded;
            age: MyModel.u8.Decoded;
        };

        export type Encodable = StructEncodable<Decoded>;

        export function encode(val: Encodable): Uint8Array {
            const encoders = {
                name: MyModel.str.encode,
                age: MyModel.u8.encode,
            };

            return _encodeStruct(val, encoders);

            // const name_encode = str.encode;
            // const age_encode = u8.encode;
        }

        export function decode(val: Uint8Array): Decoded {}
    }

    export namespace Event {
        export type Def = {
            Received: null;
            Message: Valuable<MyModel.str.Decoded>;
        };

        export type Decoded = Enum<Def>;

        export type Encodable = Enum<EnumDefEncodable<Def>>;
    }
}

// MyModel.Str.
// }
