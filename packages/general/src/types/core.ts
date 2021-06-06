export type Codec<V, N = any> = CodecPrimitive<V> | CodecComplex<V, N>;

export interface CodecPrimitive<V> {
    type: 'primitive';
    encode: (value: V) => Uint8Array;
    decode: (bytes: Uint8Array) => [V, number];
}

export interface CodecComplex<V, N> {
    type: 'complex';
    encode: (namespace: NamespaceCompiled<N>, value: V) => Uint8Array;
    decode: (namespace: NamespaceCompiled<N>, buffer: Uint8Array) => [V, number];
}

/**
 * Compiled codec - pure encode & decode functions for some value
 */
export interface CodecCompiled<V> {
    encode: (value: V) => Uint8Array;
    decode: (buffer: Uint8Array) => [V, number];
}

/**
 * Utility type, that converts namespace of values to namespace of their codecs (in this namespace)
 */
export type NamespaceAsCodecs<N> = {
    [K in keyof N]: Codec<N[K], N>;
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
export interface NamespaceCompiled<N> {
    /**
     * Looks up for type in the namespace and returns compiled codec type
     */
    lookup: <K extends keyof N>(type: K) => CodecCompiled<N[K]>;
}

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
