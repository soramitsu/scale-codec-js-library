import { DecodeResult, Codec } from '@scale-codec/core';
import { mapGetUnwrap } from '@scale-codec/util';
import { NamespaceCodec, Namespace, NamespaceDefinitions, ContextSensitiveCodec, CodecSetupContext } from './types';
import { typedToEntries } from './util';

function isContextSensitiveCodec<T, N>(item: NamespaceCodec<T, N>): item is ContextSensitiveCodec<T, N> {
    return typeof item === 'function';
}

export function defNamespace<N>(codecs: NamespaceDefinitions<N>): Namespace<N> {
    const codecsMap = new Map<keyof N, Codec<any>>();

    function encode(ref: keyof N, value: any): Uint8Array {
        return mapGetUnwrap(codecsMap, ref).encode(value);
    }

    function decode(ref: keyof N, bytes: Uint8Array): DecodeResult<any> {
        return mapGetUnwrap(codecsMap, ref).decode(bytes);
    }

    function dynCodec<K extends keyof N>(ref: K): Codec<N[K]> {
        return {
            encode: (v) => encode(ref, v),
            decode: (b) => decode(ref, b),
        };
    }

    const ctx: CodecSetupContext<N> = { dynCodec };

    // codecs setup
    typedToEntries(codecs).forEach(([codecName, universalCodec]) => {
        const normalized: Codec<any> = isContextSensitiveCodec(universalCodec)
            ? universalCodec(ctx)
            : (universalCodec as Codec<any>);
        codecsMap.set(codecName, normalized);
    });

    return {
        encode: (ref, value) => encode(ref, value),
        decode: (ref, value) => decode(ref, value)[0],
    };
}
