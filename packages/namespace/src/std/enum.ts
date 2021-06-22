import { EnumInstance, EnumNonEmptyVariants, EnumSchema } from '@scale-codec/core';
import { ContextSensitiveCodec, CompatibleNamespaceKeys } from '../types';
import { typedFromEntries, typedToEntries } from '../util';

export function defEnum<V, N>(
    schema: EnumSchema<V>,
    dynCodecs: {
        [K in EnumNonEmptyVariants<V>]: CompatibleNamespaceKeys<N, V[K]>;
    },
): ContextSensitiveCodec<EnumInstance<V>, N> {
    return {
        setup({ dynCodec }) {
            const codec = schema.createCodec(
                typedFromEntries(typedToEntries(dynCodecs).map(([k, v]) => [k, dynCodec(v)])) as any,
            );

            return codec;
        },
    };
}

/* Option */
export interface OptionVariants<T> {
    Some: T;
    None: null;
}

export type OptionInstance<T> = EnumInstance<OptionVariants<T>>;

const OPTION_SCHEMA = new EnumSchema<OptionVariants<any>>({
    None: { discriminant: 0 },
    Some: { discriminant: 1 },
});

export function defOptionEnum<T, N>(
    someValueRef: CompatibleNamespaceKeys<N, T>,
): ContextSensitiveCodec<OptionInstance<T>, N> {
    return defEnum(
        OPTION_SCHEMA,
        { Some: someValueRef } as any /* as any because TypeScript cannot know that T is not a null */,
    );
}

/* Result */

export interface ResultVariants<Ok, Err> {
    Ok: Ok;
    Err: Err;
}

export type ResultInstance<Ok, Err> = EnumInstance<ResultVariants<Ok, Err>>;

const RESULT_SCHEMA = new EnumSchema<ResultVariants<any, any>>({
    Ok: { discriminant: 0 },
    Err: { discriminant: 1 },
});

export function defResultEnum<Ok, Err, N>(
    okValueRef: CompatibleNamespaceKeys<N, Ok>,
    errValueRef: CompatibleNamespaceKeys<N, Err>,
): ContextSensitiveCodec<ResultInstance<Ok, Err>, N> {
    return defEnum(RESULT_SCHEMA, { Ok: okValueRef, Err: errValueRef });
}
