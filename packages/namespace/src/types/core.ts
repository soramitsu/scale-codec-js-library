// export type Codec<V, N = any> = CodecPrimitive<V> | CodecComplex<V, N>;

import { Codec } from '@scale-codec/core';

export type NamespaceDefinitions<N> = {
    [K in keyof N]: NamespaceCodec<N[K], N>;
};

export type NamespaceCodec<T, N> = Codec<T> | ContextSensitiveCodec<T, N>;

export interface Namespace<N> {
    encode: <K extends keyof N>(ref: K, value: N[K]) => Uint8Array;
    decode: <K extends keyof N>(ref: K, bytes: Uint8Array) => N[K];
}

export interface ContextSensitiveCodec<T, N> {
    setup: (ctx: CodecSetupContext<N>) => Codec<T>;
}

export interface CodecSetupContext<N> {
    dynCodec: <K extends keyof N>(ref: K) => Codec<N[K]>;
}

export type CompatibleNamespaceKeys<N, T> = {
    [K in keyof N]: N[K] extends T ? K : never;
}[keyof N];
