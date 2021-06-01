{
    type CodecOpts<N, V> = {
        encode: (root: Root<N>, value: V) => Uint16Array;
        // extend?: E;
    };

    type CodecType<V> = {
        encode: (value: V) => Uint16Array;
        // dec
    };

    type TypesOpts<N> = {
        [K in keyof N]: N[K] extends CodecType<infer V> ? CodecOpts<N, V> & Omit<N[K], keyof CodecType<V>> : never;
    };

    type ValuesAsCodecs<N> = {
        [K in keyof N]: CodecType<N[K]>;
    };

    // type CodeTypeValueByDefinition<V extends CodecOpts<any>> = V extends CodecOpts<any, infer V, any> ? V : never;

    // type NamespaceValues<N> = {
    //     [K in keyof N]: N[K] extends CodecOpts<any> ? CodeTypeValueByDefinition<N[K]> : never;
    // };

    // type NamespaceCodecs<N> = {
    //     [K in keyof N]: N[K] extends CodecOpts<any, any, any> ? CodecType<N[K]> : never;
    // };

    // type Def = CodecOpts<{}, number, { nya: () => void }>;
    // type Cod = CodecType<Def>;

    // type Namespace

    type Root<N> = {
        lookup: <K extends keyof N>(type: K) => N[K];
    };

    function createRoot<N>(defs: TypesOpts<N>): Root<N> {}

    type Enum<V> = {
        is<K extends keyof V>(variant: K): boolean;
    }

    type EnumConstructor<V> {
        yeay: (type: keyof V) => Enum<V>;
    }

    type OptionVariants<T> = {
        None: null;
        Some: T;
    }

    type EnumCodecType<V> = CodecType<Enum<V>> & EnumConstructor<V>;

    type NS = {
        String: CodecType<string> & { nya: () => void };
        u64: CodecType<number>;
        'Option<String>': EnumCodecType<OptionVariants<CodecTypeValue<NS['String']>>>;
    }

    createRoot<NS>({
        String: {
            encode: (root, val) => new Uint16Array(),
            nya: () => {},
        },
        u64: {
            encode: (root, val) => {
                // return root.lookup('String');
                root.lookup('String').nya();
                return new Uint16Array();
            },

            // extend: {
            //     nya: () => {}
            // }
        },
        'Option<String>': {
            encode: () => {},
            yeay: () => {}
        }
    });

    type RootTest = Root<{ Hey: Def }>;

    const root: RootTest = null;
    root.lookup('Hey');

    // function createMap<N extends {}, K extends keyof N, V extends keyof N>(
    //     key: K,
    //     value: V,
    // ): CodecOpts<{ [x in K]: CodecType<N[K]> } & { [x in V]: CodecType<N[V]> }, Map<N[K], N[V]>> {
    //     return {
    //         encode: (root, map) => {
    //             const KeyType = root.lookup(key);
    //             const ValueType = root.lookup(value);

    //             const [[k, v]] = map.entries();
    //             KeyType.encode(k);

    //             return new Uint16Array();
    //         },
    //     };
    // }

    function createMap<N, K extends keyof N, V extends keyof N>(
        keyName: K,
        valueName: V,
    ): CodecOpts<ValuesAsCodecs<N>, Map<N[K], N[V]>> {
        return {
            encode: (root, map) => {
                const KeyCodec = root.lookup(keyName);
                const [someKey] = map.keys();
                const [someVal] = map.values();

                // KeyCodec.encode()
                KeyCodec.encode(someKey);
                // ok!
                KeyCodec.encode(someVal);

                return new Uint16Array();
            },
        };
    }

    type CodecTypeValue<T> = T extends CodecType<infer V> ? V : never;

    type MapWithCodecValues<K, V> = K extends CodecOpts<any, infer TK>
        ? V extends CodecOpts<any, infer TV>
            ? Map<TK, TV>
            : never
        : never;
}
