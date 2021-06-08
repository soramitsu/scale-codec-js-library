import { Codec, Decode, decodeStruct, Encode, encodeStruct } from '@scale-codec/core';
import { CompatibleNamespaceKeys, ContextSensitiveCodec, StrKeys } from '../types';

// mapping to real namespace keys
type StructDefinition<N, S> = {
    [K in StrKeys<S>]: [K, CompatibleNamespaceKeys<N, S[K]>];
}[StrKeys<S>][];

export function defStruct<N, S>(defs: StructDefinition<N, S>): ContextSensitiveCodec<S, N> {
    return {
        setup({ dynCodec }) {
            type MapToEncoders<T> = { [K in StrKeys<T>]: Encode<T[K]> };
            type MapToDecoders<T> = { [K in StrKeys<T>]: Decode<T[K]> };

            const [encoders, decoders] = defs.reduce<[MapToEncoders<S>, MapToDecoders<S>]>(
                ([en, de], [field, typeRef]) => {
                    const codec = dynCodec(typeRef) as unknown as Codec<S[StrKeys<S>]>;
                    en[field] = codec.encode;
                    de[field] = codec.decode;
                    return [en, de];
                },
                [{} as any, {} as any],
            );

            const order: StrKeys<S>[] = defs.map(([field]) => field);

            return {
                encode: (v) => encodeStruct(v, encoders, order),
                decode: (b) => decodeStruct(b, decoders, order),
            };
        },
    };
}
