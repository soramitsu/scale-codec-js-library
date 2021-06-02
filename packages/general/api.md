# API

## Core types

```ts
/**
 * Base options of codec. Each entry in namespace definition should
 * implement this interface
 *
 * Generic `N` specifies namespace of types, `V` - codec's decoded value
 *
 * TODO do not work with uint directly - provide Writer and Reader. Performance, no unnecessary allocations
 */
export type Codec<N, V> = {
    encode: (namespace: NamespaceCompiled<N>, value: V) => Uint8Array;
    decode: (namespace: NamespaceCompiled<N>, buffer: Uint8Array) => V;
};

/**
 * Compiled codec - pure encode & decode functions for some value
 */
export type CodecCompiled<V> = {
    encode: (value: V) => Uint8Array;
    decode: (buffer: Uint8Array) => V;
};

/**
 * Utility type, that converts namespace of values to namespace of their codecs (in this namespace)
 */
export type NamespaceAsCodecs<N> = {
    [K in keyof N]: Codec<N, N[K]>;
};

/**
 * Utility type, that converts namespace of values to their compiled codecs
 */
export type NamespaceAsCompiledCodecs<N> = {
    [K in keyof N]: CodecCompiled<N[K]>;
};

/**
 * Utility type that converts namespace of codecs to their values
 */
export type CodecsAsValues<N> = {
    [K in keyof N]: N[K] extends CodecCompiled<infer V> ? V : never;
};

/**
 * Compiled namespace interface
 */
export type NamespaceCompiled<N> = {
    /**
     * Looks up for type in the namespace and returns compiled codec type
     */
    lookup: <K extends keyof N>(type: K) => CodecCompiled<N[K]>;
};

/**
 * Utility type, that returns keys from namespace of values which are compatible
 * with type `T` (that means that `T` extends the value)
 */
export type CompatibleNamespaceTypes<N, T> = {
    [K in keyof N]: T extends N[K] ? K : never;
}[keyof N];
```

## Defining namespace

All dancing around namespace type, which have that structure:

```ts
import { compileNamespace } from './namespace';
import {
    defineEnumCodec,
    defineStructCodec,
    defineVecCodec,
    Option,
    OptionVariants,
    PrimitiveCodecs,
    PrimitiveTypes,
    MapCodec,
} from './std';

type MyCustomNamespace = PrimitiveTypes & {
    Id: {
        name: string;
        domain: string;
    };
    'BTreeMap<String,Id>': Map<PrimitiveTypes['String'], MyCustomNamespace['Id']>;
    'Option<Id>': Option<MyCustomNamespace['Id']>;
    'Vec<u32>': PrimitiveTypes['u32'][];
};

const codecs = {
    Id: defineStructCodec<MyCustomNamespace, MyCustomNamespace['Id']>([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    'BTreeMap<String,Id>': MapCodec<MyCustomNamespace, 'String', 'Id'>('String', 'Id'),
    'Option<Id>': defineEnumCodec<MyCustomNamespace, OptionVariants<MyCustomNamespace['Id']>>(['None', ['Some', 'Id']]),
    'Vec<u32>': defineVecCodec<MyCustomNamespace, number>('u32'),
};

const namespace = compileNamespace<MyCustomNamespace>({
    ...PrimitiveCodecs,
    ...codecs,
});
```

And now namespace is ready to use! It's definition is not very clear, but (1) it should be specified only once and (2) it designed to be able to be generated automatically.

```ts
const map: Map<string, MyCustomNamespace['Id']> = namespace.lookup('BTreeMap<String,Id>').decode(new Uint8Array());

const maybeId: Option<MyCustomNamespace['Id']> = codecs['Option<Id>'].create('Some', {
    name: '412',
    domain: '4141',
});

const id: MyCustomNamespace['Id'] = maybeId.unwrap('Some');

namespace.lookup('Id').encode(id);
```

> Note that type annotations like `id: MyCustonNamespace['Id']` are unnecessary and only for demonstration.

## How definitions for the custom namespaces may looks like?

```ts
import { PrimitiveTypes } from './std';

interface CustomNamespaceDefinition {
    [x: string]:
        | string // alias to some type
        | keyof PrimitiveTypes // alias to some standard type
        | {
              type: 'Vec'; // or enum|tuple|struct|map
              // ...specific options for each type
          };
}
```
