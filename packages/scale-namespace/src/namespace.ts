import { Codec, DecodeResult } from '@scale-codec/core';
import { mapGetUnwrap } from '@scale-codec/util';
import { PrimitiveTypes, PrimitiveCodecs } from './std';
import { ContextSensitiveCodec } from './types';
import { typedToEntries } from './util';

export type NamespaceDefinitionCodecs<N> = {
    [K in keyof N]: Codec<N[K]> | ContextSensitiveCodec<N[K], N>;
};

export type NamespaceWithPrimitivesDefinitionCodecs<N> = {
    [K in keyof N]: Codec<N[K]> | ContextSensitiveCodec<N[K], N & PrimitiveTypes>;
};

export interface Namespace<N> {
    encode: <K extends keyof N>(ref: K, value: N[K]) => Uint8Array;
    decode: <K extends keyof N>(ref: K, bytes: Uint8Array) => N[K];
}

function isContextSensitiveCodec<V, N>(
    item: Codec<V> | ContextSensitiveCodec<V, N>,
): item is ContextSensitiveCodec<V, N> {
    return !!(item as ContextSensitiveCodec<V, N>).setup;
}

export function defNamespace<N>(codecs: NamespaceDefinitionCodecs<N>): Namespace<N> {
    const dynDispatchMap = new Map<keyof N, Codec<N[keyof N]>>();

    // defining function for dynamic dispatching of encode/decode
    function dynCodec<K extends keyof N>(name: K): Codec<N[K]> {
        return {
            encode: (v) => mapGetUnwrap(dynDispatchMap, name).encode(v),
            decode: (b) => mapGetUnwrap(dynDispatchMap, name).decode(b) as DecodeResult<N[K]>,
        };
    }

    // for codecs setup below
    const setupCtx = { dynCodec };

    // codecs setup
    typedToEntries(codecs).forEach(([codecName, item]) => {
        const codec: Codec<N[keyof N]> = isContextSensitiveCodec(item)
            ? item.setup(setupCtx)
            : // typescript cannot understand that it is Codec<T> anyway
              (item as Codec<N[keyof N]>);

        dynDispatchMap.set(codecName, codec);
    });

    return {
        encode: (ref, value) => mapGetUnwrap(dynDispatchMap, ref).encode(value),
        decode: <K extends keyof N>(ref: K, bytes: Uint8Array) =>
            mapGetUnwrap(dynDispatchMap, ref).decode(bytes)[0] as N[K],
    };
}

export function defNamespaceWithPrimitives<N>(
    codecs: NamespaceWithPrimitivesDefinitionCodecs<N>,
): Namespace<N & PrimitiveTypes> {
    return defNamespace<N & PrimitiveTypes>(
        { ...PrimitiveCodecs, ...codecs } as any /* idk why typescript sees here some error */,
    );
}
