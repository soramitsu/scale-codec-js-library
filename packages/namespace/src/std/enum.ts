import {
    Enum,
    ValuableVariants,
    EnumSchema,
    Option,
    GetValuableVariantValue,
    Result,
    GetEnumDef,
    EnumCodec,
} from '@scale-codec/core'
import { CompatibleNamespaceKeys, NamespaceCodec } from '../types'

export function defEnum<N, Def>(
    schema: EnumSchema<Def>,
    valuableVariantsRefs: {
        [K in ValuableVariants<Def>]: CompatibleNamespaceKeys<N, GetValuableVariantValue<Def[K]>>
    },
): NamespaceCodec<Enum<Def>, N> {
    return ({ dynCodec }) => {
        const scale: EnumCodec<Def> = schema.createCodec(
            Object.fromEntries(
                Object.entries(valuableVariantsRefs).map(([variant, ref]) => [variant, dynCodec(ref as any)]),
            ) as any,
        )

        return scale
    }
}

const OPTION_SCHEMA = new EnumSchema<GetEnumDef<Option<any>>>({
    None: { discriminant: 0 },
    Some: { discriminant: 1 },
})

/**
 * `Option<T>` enum definition shorthand
 */
export function defOption<T, N>(someRef: CompatibleNamespaceKeys<N, T>): NamespaceCodec<Option<T>, N> {
    return defEnum(OPTION_SCHEMA, { Some: someRef })
}

const RESULT_SCHEMA = new EnumSchema<GetEnumDef<Result<any, any>>>({
    Ok: { discriminant: 0 },
    Err: { discriminant: 1 },
})

/**
 * `Result<O, E>` enum definition shorthand
 */
export function defResult<O, E, N>(
    okRef: CompatibleNamespaceKeys<N, O>,
    errRef: CompatibleNamespaceKeys<N, E>,
): NamespaceCodec<Result<O, E>, N> {
    return defEnum(RESULT_SCHEMA, { Ok: okRef, Err: errRef })
}
