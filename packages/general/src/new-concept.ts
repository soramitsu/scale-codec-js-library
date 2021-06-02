type Struct<Fields> = Fields;

// or may be with mark?
const StructMark = Symbol('struct');
type StructMarked<Fields> = Fields & {
    [StructMark]: true;
};

type Tuple<T extends any[]> = T;
// also can be marked?

// basic enum __instance__ example
type Enum<V> = {
    is<K extends keyof V>(k: K): boolean;
};

type NamespacePure = {
    // primitives. they do not depend on any other type

    // numbers
    u32: number;
    i8: number;
    // or u32: Num<'unsigned', 32> ?

    String: string;
    // or some special type?

    bool: boolean;
    // or some special type?

    '()': unknown; // how to define empty tuple primitive? Or not so primitive?

    // non-primitive types

    // struct
    // is it may contain anything?
    // yeah, why not. concrete constraints about fields will be at the stage of actual struct codec definition
    Id: {
        // specifing actual types not directly, but via defined in namespace types
        // such style will be helpfull for auto-generated namespaces
        name: NamespacePure['String'];
        domain: NamespacePure['String'];
    };
    IdTyped: Struct<{
        name: NamespacePure['String'];
        domain: NamespacePure['String'];
    }>;

    // Tuple
    NameAge: Tuple<[NamespacePure['String'], NamespacePure['u32']]>;

    // Enum
    OneOrTwo: Enum<{
        One: null;
        Two: null;
    }>;

    // or Struct<{ name: string; domain: string }> ?
};

function createEnum<N>(k: keyof N): EncodeDecodeNamespaced<N, Enum<{}>> {
    return null;
}

const NamespaceCodecs = {
    enum: createEnum<NamespacePure>('Id'),
};

// const Namespace: { [K in keyof NamespacePure]: EncodeDecodeNamespaced<NamespacePure, NamespacePure[K]> } = {
// u
// }

// declare function defineExtendsNamespace<N>

type Codecs = {
    [name in string]: {
        // codec:
    };
};

const Root = {
    encode: () => {
        Root.encode();
    },
};

type EncodeDecodeNamespaced<N, V> = {
    encode: (ns: N, val: V) => [];
    decode: (ns: N, arr: []) => V;
};

// type Namespace<N

// type EncodeDecode

// type NamespaceCodecs

// type CodecOptionsBase<O extends PureNamespaceDefaultOptions<O>, V> = {
//     encode: (ns: NamespaceCompiled<O>, val: V) => [];
//     decode: (ns: NamespaceCompiled<O>, arr: []) => V;
// };

type NamespaceCompiled<N> = {
    // lookup: <K extends keyof N>(type: K) => CodecCompiled<N[K]>;
    // /**
    //  * Returns raw options of codec. This is the place where can be custom props or methods.
    //  */
    // lookupRaw: <K extends keyof O>(type: K) => O[K];

    /**
     * Returns compiled version of some codec - no need to specify namespace in them.
     * ERGONOMICS
     */
    lookup: <K extends keyof N>(type: K) => CodecCompiled<N[K]>;

    // // also about ergonomics

    // encode: <K extends keyof N>(type: K, value: N[K]) => [];
    // decode: <K extends keyof N>(type: K, bytes: []) => N[K];
};

type CodecCompiled<T> = T extends EncodeDecodeNamespaced<any, infer V>
    ? {
          encode: (val: V) => [];
          decode: (arr: []) => V;
      }
    : never;

declare function defineNamespaceRuntime<O extends PureNamespaceDefaultOptions<O>>(options: O): NamespaceCompiled<O>;

type PureNamespaceDefaultOptions<N> = {
    [K in keyof N]: CodecOptionsBase<N, unknown>;
};

const namespace = defineNamespaceRuntime({
    String: {} as CodecOptionsBase<any, string>,
});

{
    type Entry<X> = {
        nya: (root: X) => void;
    };

    declare function defineRoot<R extends { [x in any]: Entry<R> }>(root: R): R;

    const root = defineRoot({
        hey: {
            nya: (r) => {},
        },
    });
}

// namespace

// declare function defineNamespaceOptions<N>()

// type ConvertNamespaceToCodec<N> = {
//     [K in keyof N]: N[K]
// }
