import {
    Enum,
    ValuableVariants,
    EnumSchema,
    Option,
    GetValuableVariantValue,
    Result,
    GetEnumDef,
} from '@scale-codec/core';
import { ContextSensitiveCodec, CompatibleNamespaceKeys } from '../types';
import { typedFromEntries, typedToEntries } from '../util';

export function defEnum<Def, N>(
    schema: EnumSchema<Def>,
    dynCodecs: {
        [K in ValuableVariants<Def>]: CompatibleNamespaceKeys<N, GetValuableVariantValue<Def[K]>>;
    },
): ContextSensitiveCodec<Enum<Def>, N> {
    return {
        setup({ dynCodec }) {
            const codec = schema.createCodec(
                typedFromEntries(typedToEntries(dynCodecs).map(([k, v]) => [k, dynCodec(v)])) as any,
            );

            return codec;
        },
    };
}

const OPTION_SCHEMA = new EnumSchema<GetEnumDef<Option<any>>>({
    None: { discriminant: 0 },
    Some: { discriminant: 1 },
});

/**
 * `Option<T>` enum definition shorthand
 */
export function defOptionEnum<T, N>(someValueRef: CompatibleNamespaceKeys<N, T>): ContextSensitiveCodec<Option<T>, N> {
    return defEnum(OPTION_SCHEMA, { Some: someValueRef });
}

const RESULT_SCHEMA = new EnumSchema<GetEnumDef<Result<any, any>>>({
    Ok: { discriminant: 0 },
    Err: { discriminant: 1 },
});

/**
 * `Result<O, E>` enum definition shorthand
 */
export function defResultEnum<O, E, N>(
    okValueRef: CompatibleNamespaceKeys<N, O>,
    errValueRef: CompatibleNamespaceKeys<N, E>,
): ContextSensitiveCodec<Result<O, E>, N> {
    return defEnum(RESULT_SCHEMA, { Ok: okValueRef, Err: errValueRef });
}
