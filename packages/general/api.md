# API

## Core types

```ts
/**
 * Base options of codec. Each entry in namespace definition should
 * implement this interface
 *
 * Generic `N` specifies namespace of codecs, `V` - codec's decoded value
 */
export type CodecOptions<N, V> = {
    encode: (root: Namespace<N>, value: V) => Uint8Array;
    decode: (root: Namespace<N>, buffer: Uint8Array) => V;
};

/**
 * Base Codec interface. `CodecOptions` compiles to it inside of namespace.
 * Generic `V` specifies the decoded value
 */
export type CodecType<V> = {
    encode: (value: V) => Uint8Array;
    decode: (buffer: Uint8Array) => V;
};

/**
 * Utility type, that converts namespace of codec types to namespace of their options
 */
export type TypesOpts<N> = {
    [K in keyof N]: N[K] extends CodecType<infer V> ? CodecOptions<N, V> & Omit<N[K], keyof CodecType<V>> : never;
};

/**
 * Utility type, that converts namespace of values to base codec types with this values
 */
export type ValuesAsCodecs<N> = {
    [K in keyof N]: CodecType<N[K]>;
};

/**
 * Utility type that converts namespace of codecs to their values
 */
export type CodecsAsValues<N> = {
    [K in keyof N]: N[K] extends CodecType<infer V> ? V : never;
};

/**
 * Compiled namespace interface
 */
export type Namespace<N> = {
    /**
     * Looks up for type in the namespace and returns compiled codec type
     */
    lookup: <K extends keyof N>(type: K) => N[K];
};

/**
 * Utility type, that returns keys from namespace of codecs (`N`), which codec types values are compatible
 * with type `T` (that means that `T` extends the value of codec)
 */
export type CompatibleNamespaceTypes<N, T> = {
    [K in keyof N]: N[K] extends CodecType<infer V> ? (T extends V ? K : never) : never;
}[keyof N];

/**
 * Utility type that extracts codec value from namespace by key
 */
export type NamespaceValue<N, K extends keyof N> = CodecTypeValue<N[K]>;

/**
 * Extracts value of `CodecType`
 */
export type CodecTypeValue<T> = T extends CodecType<infer V> ? V : never;
```

## Defining namespace

All dancing around namespace type, which have that structure:

```ts
import { defineEnumCodec, EnumCodecType } from './enum';
import { defineMapCodec } from './map';
import { defineNamespace } from './namespace';
import { defineStructCodec } from './struct';
import { CodecType, NamespaceValue } from './types';
import { StringCodec } from './string';
import { defineTupleCodec, Tuple } from './tuple';
import { defineVecCodec, VecCodecType } from './vec';
import { CodecNumber, u32 } from './numbers';

// specifying namespace as map of codec types

type NS = {
    Id: CodecType<{
        name: string;
        domain: string;
    }>;
    String: CodecType<string>;
    'BTreeMap<string, Id>': CodecType<Map<string, NamespaceValue<NS, 'Id'>>>;
    'Option<Id>': EnumCodecType<{ None: null; Some: NamespaceValue<NS, 'Id'> }>;
    '()': CodecType<Tuple<[]>>;
    'Vec<u32>': VecCodecType<CodecNumber>;
    u32: CodecType<CodecNumber>;
};

// defining (compiling) namespace from codec options

const namespace = defineNamespace<NS>({
    Id: defineStructCodec<NS, NamespaceValue<NS, 'Id'>>([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    String: StringCodec,
    'BTreeMap<string, Id>': defineMapCodec('String', 'Id'),
    'Option<Id>': defineEnumCodec<NS, NS['Option<Id>'] extends EnumCodecType<infer V> ? V : never>([
        'None',
        ['Some', 'Id'],
    ]),
    '()': defineTupleCodec([]),
    u32: u32,
    'Vec<u32>': defineVecCodec('u32'),
});
```

For now, namespace is ready to use! Yes, it's definition is not very clear, but we should specify namespace only once and then use types from it type-safe and without boilerplate.

```ts
const id: Id = {
    name: 'Some name',
    domain: 'Soramitsu',
};

const idEncoded = namespace.lookup('Id').encode(id);

const decoded = namespace.lookup('Id').decode(idEncoded);
```
