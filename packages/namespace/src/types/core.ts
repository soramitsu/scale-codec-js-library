import { Codec } from '@scale-codec/core'

export type NamespaceDefinitions<N> = {
    [K in keyof N]: NamespaceCodec<N[K], N>
}

export type NamespaceCodec<T, N> = Codec<T> | ContextSensitiveCodec<T, N>

export interface Namespace<N> {
    encode: <K extends keyof N>(ref: K, value: N[K]) => Uint8Array
    decode: <K extends keyof N>(ref: K, bytes: Uint8Array) => N[K]
}

export type ContextSensitiveCodec<T, N> = (ctx: CodecSetupContext<N>) => Codec<T>

export interface CodecSetupContext<N> {
    dynCodec: <K extends keyof N>(ref: K) => Codec<N[K]>
}

export type CompatibleNamespaceKeys<N, T> = {
    [K in keyof N]: T extends N[K] ? K : never
}[keyof N]
