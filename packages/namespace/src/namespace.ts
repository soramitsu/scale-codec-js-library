import { DecodeResult, Codec } from '@scale-codec/core';
import { mapGetUnwrap } from '@scale-codec/util';
import { NamespaceCodec, Namespace, NamespaceDefinitions, ContextSensitiveCodec, CodecSetupContext } from './types';
import { typedToEntries } from './util';

function isContextSensitiveCodec<T, N>(item: NamespaceCodec<T, N>): item is ContextSensitiveCodec<T, N> {
    return !!(item as ContextSensitiveCodec<T, N>).setup;
}

export function defNamespace<N>(codecs: NamespaceDefinitions<N>): Namespace<N> {
    const codecsMap = new Map<keyof N, Codec<any>>();

    function dynCodec<K extends keyof N>(ref: K): Codec<N[K]> {
        return {
            encode: (v) => mapGetUnwrap(codecsMap, ref).encode(v),
            decode: (b) => mapGetUnwrap(codecsMap, ref).decode(b) as DecodeResult<N[K]>,
        };
    }

    const ctx: CodecSetupContext<N> = { dynCodec };

    // codecs setup
    typedToEntries(codecs).forEach(([codecName, universalCodec]) => {
        const normalized: Codec<any> = isContextSensitiveCodec(universalCodec)
            ? universalCodec.setup(ctx)
            : (universalCodec as Codec<any>);
        codecsMap.set(codecName, normalized);
    });

    return {
        encode: (ref, value) => mapGetUnwrap(codecsMap, ref).encode(value),
        decode: <K extends keyof N>(ref: K, bytes: Uint8Array) => mapGetUnwrap(codecsMap, ref).decode(bytes)[0] as N[K],
    };
}
