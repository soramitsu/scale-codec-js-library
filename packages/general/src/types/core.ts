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

// /**
//  * Utility type that extracts codec value from namespace by key
//  */
// export type NamespaceValue<N, K extends keyof N> = CodecTypeValue<N[K]>;

// /**
//  * Extracts value of `CodecType`
//  */
// export type CodecTypeValue<T> = T extends CodecCompiled<infer V> ? V : never;
