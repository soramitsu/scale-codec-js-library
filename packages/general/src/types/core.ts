export type CodecType<V> = {
    encode: (value: V) => Uint8Array;
    decode: (buffer: Uint8Array) => V;
    // create?: (something: Default) => V;
    // createFromVoid?: () => V;
};

// export type CodecTypeExtensions<E> = {
//     __custom_extensions_mark__: E;
// };

// /**
//  * it should be always casted 'as' internally when creating enum codec
//  */
// export type EnumMark<Variants> = {
//     /**
//      * @internal
//      */
//     __enum__: Variants;
// };

export type CompatibleNamespaceTypes<N, T> = {
    [K in keyof N]: N[K] extends T ? K : never;
}[keyof N];

// export type VariantsValues<V extends {}> = {
//     [K in StrKeys<V>]: V[K];
// }[StrKeys<V>];

export type StrKeys<T> = keyof T & string;

// const a: CodecType<Enum<{ Some: string; None: null }>> = null;
// a.create('None');

// type TTT = EnumMark<{ Some: string }>

// type AAA = CodecType<TTT>

export type CodecTypeValue<C extends CodecType<unknown>> = C extends CodecType<infer V> ? V : never;

export type NamespaceOptions<N extends {}> = {
    [K in keyof N]: CodecTypeOptions<N, N[K]>;
};

export interface Root<N extends {}> {
    lookup: RootLoolupFn<N>;
    encode: RootEncodeFn<N>;
    decode: RootDecodeFn<N>;
}

export type RootLoolupFn<N extends {}> = <K extends keyof N>(type: K) => CodecType<N[K]>;

export type RootEncodeFn<N extends {}> = <K extends keyof N>(type: K, value: N[K]) => Uint8Array;

export type RootDecodeFn<N extends {}> = <K extends keyof N>(type: K, buffer: Uint8Array) => N[K];

// definition internal, frame worked
export type CodecTypeOptions<N extends {}, V extends any, R = Root<N>> = {
    encode: (root: R, value: V) => Uint8Array;
    decode: (root: R, buffer: Uint8Array) => V;
    // create?: <V>(root: R, value: V) => T;
    // createFromVoid?: (root: R) => T;
};

export type NamespaceToCodecTypes<N extends {}> = {
    [K in keyof N]: CodecType<N[K]>;
};
