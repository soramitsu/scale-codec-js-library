import {
    Encode,
    StructEncoders,
    TupleEncoders,
    Enum,
    StructDecoders,
    EnumEncoders,
    EnumDecoders,
    TupleDecoders,
    Option,
    Result,
    encodeFactory,
    createStructEncoder,
    createStructDecoder,
    EnumGenericDef,
    EnumDef,
    Decode,
    createEnumEncoder,
    createEnumDecoder,
    createArrayEncoder,
    createArrayDecoder,
    createVecEncoder,
    createVecDecoder,
    createTupleEncoder,
    createTupleDecoder,
    createSetEncoder,
    createSetDecoder,
    createMapEncoder,
    createMapDecoder,
    createUint8ArrayEncoder,
    createUint8ArrayDecoder,
    Walker,
} from '@scale-codec/core'
import { mapGetUnwrap } from '@scale-codec/util'
import { trackRefineDecodeLoc } from './tracking'
import {
    createBuilder,
    FragmentBuilder,
    FragmentWrapFn,
    Fragment,
    UnwrapFragment,
    FragmentOrBuilderValue,
    FragmentOrBuilderUnwrapped,
} from './fragment'

/**
 * Useful for circular dependencies and aliasing
 */
export class DynBuilder<T extends FragmentBuilder<any>>
    implements FragmentBuilder<FragmentOrBuilderValue<T>, FragmentOrBuilderUnwrapped<T>>
{
    private __fn: () => T

    public constructor(builderGetter: () => T) {
        this.__fn = builderGetter
    }

    public wrap(
        unwrappedValue: FragmentOrBuilderUnwrapped<T>,
    ): Fragment<FragmentOrBuilderValue<T>, FragmentOrBuilderUnwrapped<T>> {
        return this.__fn().wrap(unwrappedValue)
    }

    public defineUnwrap(unwrappedValue: FragmentOrBuilderUnwrapped<T>): FragmentOrBuilderUnwrapped<T> {
        return this.__fn().defineUnwrap(unwrappedValue)
    }

    public decode(walker: Walker): Fragment<FragmentOrBuilderValue<T>, FragmentOrBuilderUnwrapped<T>> {
        return this.__fn().decode(walker)
    }

    public fromValue(
        value: FragmentOrBuilderValue<T>,
    ): Fragment<FragmentOrBuilderValue<T>, FragmentOrBuilderUnwrapped<T>> {
        return this.__fn().fromValue(value)
    }

    public fromBuffer(bytes: Uint8Array): Fragment<FragmentOrBuilderValue<T>, FragmentOrBuilderUnwrapped<T>> {
        return this.__fn().fromBuffer(bytes)
    }

    /**
     * Just returns the builder itself
     */
    public getBuilder(): T {
        return this.__fn()
    }
}

export function dynBuilder<T extends FragmentBuilder<any>>(dyn: () => T): DynBuilder<T> {
    return new DynBuilder(dyn)
}

export type UnwrapScaleStruct<T> = {
    [K in keyof T]: UnwrapFragment<T[K]>
}

function unwrapScaleStruct<T>(scale: Fragment<T, UnwrapScaleStruct<T>>): UnwrapScaleStruct<T> {
    return Object.fromEntries(Object.entries(scale.value).map(([key, item]) => [key, item.unwrap()])) as any
}

function createScaleStructWrapper<T>(schema: StructBuilderSchema<T>): FragmentWrapFn<T, UnwrapScaleStruct<T>> {
    return (raw) => {
        const inner: T = {} as any

        for (const [field, builder] of schema) {
            ;(inner as any)[field] = builder.wrap(raw[field])
        }

        return inner
    }
}

export type StructBuilderSchema<T> = [fieldName: keyof T & string, builder: FragmentBuilder<any>][]

/**
 * Defines builder for struct which fields (in wrapped state) are `Fragment`s
 */
export type ScaleStructBuilder<T extends { [K in keyof T]: Fragment<any> }> = FragmentBuilder<T, UnwrapScaleStruct<T>>

export const encodeAnyFragment: Encode<Fragment<any>> = encodeFactory(
    (fragment, walker) => fragment.encode(walker),
    (fragment) => fragment.sizeHint,
)

/**
 * @remarks
 *
 * To make it type-safe, you may use this syntax:
 *
 * ```ts
 * const Account: ScaleStructBuilder<{
 *   name: Fragment<string>
 *   // extract the type from another builder
 *   second_name: FragmentFromBuilder<typeof Str>
 * }> = createStructBuilder('Account', [['name', Str], ['second_name', Str]])
 * ```
 */
export function createStructBuilder<T extends { [K in keyof T]: Fragment<any> }>(
    name: string,
    schema: StructBuilderSchema<T>,
): ScaleStructBuilder<T> {
    const decoders: StructDecoders<T> = []
    const encoders: StructEncoders<T> = []

    for (const [field, builder] of schema) {
        decoders.push([field, (walker) => trackRefineDecodeLoc(`.${field}`, () => builder.decode(walker)) as any])
        encoders.push([field, encodeAnyFragment])
    }

    return createBuilder(
        name,
        createStructEncoder(encoders),
        createStructDecoder(decoders),
        unwrapScaleStruct,
        createScaleStructWrapper<T>(schema),
    )
}

export type ScaleEnum = Enum<string | [string, Fragment<any>]>

export type UnwrapScaleEnum<T extends ScaleEnum> = T extends Enum<infer Def>
    ? Enum<Def extends [infer Tag, infer V] ? (V extends Fragment<any, infer U> ? [Tag, U] : never) : Def>
    : never

function unwrapScaleEnum<T extends ScaleEnum>(fragment: Fragment<T, any>): UnwrapScaleEnum<T> {
    const { isEmpty, value, tag } = fragment.value

    if (isEmpty) {
        return Enum.variant(tag as any)
    }

    if (!(value instanceof Fragment)) throw new Error(`Value of an Enum with tag "${tag}" is not a Fragment`)

    return Enum.variant<any>(tag, value.unwrap())
}

export type EnumBuilderSchema<Def extends EnumGenericDef> = (Def extends string
    ? [discriminant: number, tag: Def]
    : Def extends [infer T, infer V]
    ? V extends Fragment<infer FT, infer FU>
        ? [discriminant: number, tag: T, builder: FragmentBuilder<FT, FU>]
        : never
    : never)[]

function createScaleEnumWrapper<T extends ScaleEnum>(
    schema: EnumBuilderSchema<EnumDef<T>>,
): FragmentWrapFn<T, UnwrapScaleEnum<T>> {
    const wrappers = new Map<string, FragmentBuilder<any>>()

    for (const [, name, builderFn] of schema) {
        builderFn && wrappers.set(name, builderFn)
    }

    return ({ tag, value, isEmpty }) => {
        if (!isEmpty) {
            const builder = mapGetUnwrap(wrappers, tag)
            return Enum.variant<any>(tag, builder.wrap(value))
        }
        return Enum.variant<any>(tag)
    }
}

export type ScaleEnumBuilder<T extends Enum<any>> = FragmentBuilder<T, UnwrapScaleEnum<T>>

// & {
//     /**
//      * A set of helpers to create internal Enum variants in unwrapped state.
//      *
//      * @example
//      * ```ts
//      * const State: ScaleEnumBuilder<Enum<{
//      *   Pending: null,
//      *   Fulfilled: Valuable<Fragment<string>>
//      * }>> = createEnumBuilder(...someArgs)
//      *
//      * const state1 = State.variantsUnwrapped.Pending
//      * const state2 = State.variantsUnwrapped.Fulfilled('20 coins')
//      * ```
//      */
//     variantsUnwrapped: ScaleEnumBuilderVariantsUnwrapped<T>

//     /**
//      * A set of shorthands to construct fragments from Enum's variants
//      *
//      * @example
//      * ```ts
//      * const State: ScaleEnumBuilder<Enum<{
//      *   Pending: null,
//      *   Fulfilled: Valuable<Fragment<string>>
//      * }>> = createEnumBuilder(...someArgs)
//      *
//      * const state1 = State.variants.Pending
//      * const state2 = State.variants.Fulfilled(Str.fromValue('30 coins'))
//      * ```
//      */
//     variants: ScaleEnumBuilderVariants<T>
// }

// export type ScaleEnumBuilderVariantsUnwrapped<T extends Enum<any>> = T extends Enum<infer D>
//     ? {
//           [K in TagsEmpty<D>]: UnwrapScaleEnum<T>
//       } & {
//           [K in TagsValuable<D>]: (value: UnwrapFragment<GetValuableVariantValue<D[K]>>) => UnwrapScaleEnum<T>
//       }
//     : never

// export type ScaleEnumBuilderVariants<T extends Enum<any>> = T extends Enum<infer D>
//     ? {
//           [K in TagsEmpty<D>]: Fragment<T, UnwrapScaleEnum<T>>
//       } & {
//           [K in TagsValuable<D>]: (value: GetValuableVariantValue<D[K]>) => Fragment<T, UnwrapScaleEnum<T>>
//       }
//     : never

// /**
//  * @param varsMetadata - key - variant name, value - is it valuable or not
//  */
// function createEnumBuilderVariantsUnwrapped<T extends Enum<any>>(
//     varsMetadata: Map<string, boolean>,
// ): ScaleEnumBuilderVariantsUnwrapped<T> {
//     type Variant = Readonly<Enum<any> | ((value: any) => Enum<any>)>

//     const cache: Map<string, Variant> = new Map()

//     return new Proxy(
//         {},
//         {
//             get(_target, prop: string) {
//                 if (!varsMetadata.has(prop)) return undefined

//                 let variant: Variant
//                 if (!cache.has(prop)) {
//                     const isValuable = varsMetadata.get(prop)!

//                     variant = Object.freeze(
//                         isValuable ? (value: any) => Enum.valuable<any, any>(prop, value) : Enum.empty<any>(prop),
//                     )
//                     cache.set(prop, variant)
//                 } else {
//                     variant = cache.get(prop)!
//                 }

//                 return variant
//             },
//         },
//     ) as any
// }

// function createEnumBuilderVariants<T extends Enum<any>>(
//     varsMetadata: Map<string, boolean>,
//     builder: FragmentBuilder<T, UnwrapScaleEnum<T>>,
// ): ScaleEnumBuilderVariants<T> {
//     return new Proxy(
//         {},
//         {
//             get(_target, prop: string) {
//                 if (!varsMetadata.has(prop)) return undefined

//                 const isValuable = varsMetadata.get(prop)!

//                 return isValuable
//                     ? (value: any) => builder.fromValue(Enum.valuable<any, any>(prop, value) as any)
//                     : builder.fromValue(Enum.empty<any>(prop) as any)
//             },
//         },
//     ) as any
// }

/**
 * @example
 * ```ts
 * const Message: ScaleEnumBuilder<Enum<{
 *   Quit: null
 *   Greeting: Valuable<Fragment<string>>
 * }>> = createEnumBuilder('Message', [[0, 'Quit'], [1, 'Greeting', Str]])
 * ```
 */
export function createEnumBuilder<T extends ScaleEnum>(
    name: string,
    schema: EnumBuilderSchema<EnumDef<T>>,
): ScaleEnumBuilder<T> {
    const encoders: EnumEncoders<EnumDef<T>> = {} as any
    const decoders: EnumDecoders<EnumDef<T>> = {}
    // const varsMetadata = new Map<string, boolean>()

    for (const [dis, tag, builder] of schema) {
        ;(encoders as any)[tag] = builder ? [dis, encodeAnyFragment] : dis

        // const decode: Decode<any> = (walker) => trackRefineDecodeLoc(`::${tag}`, () => builder?.runDecode())
        ;(decoders as any)[dis] = builder
            ? [tag, ((walker) => trackRefineDecodeLoc(`::${tag}`, () => builder.decode(walker))) as Decode<any>]
            : tag

        // encoders[tag] = { d: dis, encode: codec && fragmentEncode }
        // decoders[dis] = {
        //     v: tag,
        //     decode: codec && ((b) => trackRefineDecodeLoc(`::${tag}`, () => codec.runDecode(b))),
        // }
        // varsMetadata.set(tag, !!codec)
    }

    return createBuilder(
        name,
        createEnumEncoder(encoders),
        createEnumDecoder(decoders),
        unwrapScaleEnum,
        createScaleEnumWrapper(schema),
    )

    // Reflect.defineProperty(builder, 'variantsUnwrapped', {
    //     value: createEnumBuilderVariantsUnwrapped(varsMetadata),
    // })
    // Reflect.defineProperty(builder, 'variants', {
    //     value: createEnumBuilderVariants(varsMetadata, builder),
    // })

    // return builder as any as ScaleEnumBuilder<T>
}

type UnwrapScaleArray<T> = T extends Fragment<any, infer U>[] ? UnwrapFragment<U>[] : never

function unwrapScaleArray<T>(scale: Fragment<T>): UnwrapScaleArray<T> {
    return (scale.value as unknown as Fragment<any>[]).map((x) => x.unwrap()) as any
}

function createScaleArrayWrapper<T extends Fragment<any>[]>(
    builder: ArrayItemBuilder<T>,
): FragmentWrapFn<T, UnwrapScaleArray<T>> {
    const mapper = (x: any): Fragment<any> => builder.wrap(x)

    return (rawArray) => {
        return rawArray.map(mapper) as any
    }
}

export type ArrayItemBuilder<T> = T extends Fragment<infer V, infer U>[] ? FragmentBuilder<V, U> : never

export type ScaleArrayBuilder<T extends Fragment<any>[]> = FragmentBuilder<T, UnwrapScaleArray<T>>

/**
 * @example
 * ```ts
 * const Array_u32_l5: ScaleArrayBuilder<FragmentFromBuilder<typeof U32>[]> =
 *   createArrayBuilder('Array_u32_l5', U32, 5)
 * ```
 */
export function createArrayBuilder<T extends Fragment<any>[]>(
    name: string,
    itemBuilder: ArrayItemBuilder<T>,
    len: number,
): ScaleArrayBuilder<T> {
    return createBuilder<T, UnwrapScaleArray<T>>(
        name,
        createArrayEncoder(encodeAnyFragment, len),
        createArrayDecoder((walker) => itemBuilder.decode(walker), len) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    )
}

/**
 * @example
 * ```ts
 * const VecU32: ScaleArrayBuilder<FragmentFromBuilder<typeof U32>[]> =
 *   createArrayBuilder('VecU32', U32)
 * ```
 */
export function createVecBuilder<T extends Fragment<any>[]>(
    name: string,
    itemBuilder: ArrayItemBuilder<T>,
): ScaleArrayBuilder<T> {
    return createBuilder<T, UnwrapScaleArray<T>>(
        name,
        createVecEncoder(encodeAnyFragment),
        createVecDecoder((walker) => itemBuilder.decode(walker)) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    )
}

type UnwrapScaleSet<T> = T extends Set<Fragment<any, infer U>> ? Set<UnwrapFragment<U>> : never

function unwrapScaleSet<T>(scale: Fragment<T>): UnwrapScaleSet<T> {
    return new Set([...(scale.value as any as Set<Fragment<any>>)].map((x) => x.unwrap())) as any
}

function createScaleSetWrapper<T>(builder: SetEntryBuilder<T>): FragmentWrapFn<T, UnwrapScaleSet<T>> {
    return (raw) => new Set([...raw].map((x) => builder.wrap(x))) as any
}

type SetEntryBuilder<T> = T extends Set<Fragment<infer V>> ? FragmentBuilder<V> : never

export type ScaleSetBuilder<T extends Set<Fragment<any>>> = FragmentBuilder<T, UnwrapScaleSet<T>>

/**
 * @example
 * ```ts
 * const SetU32: ScaleSetBuilder<Set<FragmentFromBuilder<typeof U32>>> =
 *   createSetBuilder('SetU32', U32)
 * ```
 */
export function createSetBuilder<T extends Set<Fragment<any>>>(
    name: string,
    itemBuilder: SetEntryBuilder<T>,
): ScaleSetBuilder<T> {
    return createBuilder(
        name,
        createSetEncoder(encodeAnyFragment),
        createSetDecoder((walker) => itemBuilder.decode(walker)),
        unwrapScaleSet as any,
        createScaleSetWrapper(itemBuilder),
    ) as any
}

type MapKeyInner<T> = T extends Map<Fragment<infer V>, Fragment<any>> ? V : never

type MapValueInner<T> = T extends Map<Fragment<any>, Fragment<infer V>> ? V : never

export type UnwrapScaleMap<T> = T extends Map<Fragment<any, infer K>, Fragment<any, infer V>>
    ? Map<UnwrapFragment<K>, UnwrapFragment<V>>
    : never

function unwrapScaleMap<T extends Map<Fragment<any>, Fragment<any>>>(scale: Fragment<T>): UnwrapScaleMap<T> {
    return new Map([...scale.value].map(([key, value]) => [key.unwrap(), value.unwrap()])) as any
}

function createScaleMapWrapper<T extends Map<Fragment<any>, Fragment<any>>>(
    key: FragmentBuilder<MapKeyInner<T>>,
    value: FragmentBuilder<MapValueInner<T>>,
): FragmentWrapFn<T, UnwrapScaleMap<T>> {
    return (raw) => {
        return new Map([...raw].map(([k, v]) => [key.wrap(k), value.wrap(v)])) as any
    }
}

export type ScaleMapBuilder<T extends Map<Fragment<any>, Fragment<any>>> = FragmentBuilder<T, UnwrapScaleMap<T>>

/**
 * @example
 * ```ts
 * const MapStrBool: ScaleMapBuilder<Map<FragmentFromBuilder<typeof Str>, FragmentFromBuilder<typeof Bool>>> =
 *   createMapBuilder('MapStrBool', Str, Bool)
 * ```
 */
export function createMapBuilder<T extends Map<Fragment<any>, Fragment<any>>>(
    name: string,
    keyBuilder: FragmentBuilder<MapKeyInner<T>>,
    valueBuilder: FragmentBuilder<MapValueInner<T>>,
): ScaleMapBuilder<T> {
    return createBuilder(
        name,
        createMapEncoder(encodeAnyFragment, encodeAnyFragment),
        createMapDecoder(
            (walker) => trackRefineDecodeLoc('<key>', () => keyBuilder.decode(walker)),
            (walker) => trackRefineDecodeLoc('<value>', () => valueBuilder.decode(walker)),
        ),
        unwrapScaleMap as any,
        createScaleMapWrapper(keyBuilder, valueBuilder),
    ) as any
}

export function createBytesArrayBuilder(name: string, len: number): FragmentBuilder<Uint8Array> {
    return createBuilder(name, createUint8ArrayEncoder(len), createUint8ArrayDecoder(len))
}

type UnwrapScaleTuple<T> = T extends Fragment<any>[]
    ? T extends [Fragment<any, infer U>, ...infer Tail]
        ? [UnwrapFragment<U>, ...UnwrapScaleTuple<Tail>]
        : []
    : never

function createScaleTupleWrapper<T>(builder: FragmentBuilder<any>[]): FragmentWrapFn<T, UnwrapScaleTuple<T>> {
    return (raw) => raw.map((x, i) => builder[i].wrap(x)) as any
}

export type ScaleTupleBuilder<T> = FragmentBuilder<T, UnwrapScaleTuple<T>>

/**
 * @example
 * ```ts
 * const U32_U32: ScaleTupleBuilder<[FragmentFromBuilder<typeof U32>, FragmentFromBuilder<typeof U32>]> =
 *   createTupleBuilder('U32_U32', [U32, U32])
 * ```
 */
export function createTupleBuilder<T extends Fragment<any>[]>(
    name: string,
    builders: FragmentBuilder<any>[],
): ScaleTupleBuilder<T> {
    const encoders: TupleEncoders<T> = Array.from(
        { length: builders.length },
        () => encodeAnyFragment,
    ) as TupleEncoders<T>

    const decoders: TupleDecoders<T> = builders.map<Decode<any>>(
        (builder, i) => (walker) => trackRefineDecodeLoc(`.${i}`, () => builder.decode(walker)),
    ) as TupleDecoders<T>

    return createBuilder(
        name,
        createTupleEncoder(encoders),
        createTupleDecoder(decoders),
        unwrapScaleArray as any,
        createScaleTupleWrapper(builders),
    )
}

type OptionBuilder<T> = T extends Option<Fragment<infer V, infer U>> ? FragmentBuilder<V, U> : never

/**
 * @example
 * ```ts
 * const OptionStr: ScaleEnumBuilder<Option<FragmentFromBuilder<typeof Str>>> =
 *   createOptionBuilder('OptionStr', Str)
 * ```
 */
export function createOptionBuilder<T extends Option<Fragment<any>>>(
    name: string,
    some: OptionBuilder<T>,
): ScaleEnumBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'None'],
        [1, 'Some', some],
    ]) as any
}

type ResultOkBuilder<T> = T extends Result<Fragment<infer V, infer U>, Fragment<any, any>>
    ? FragmentBuilder<V, U>
    : never

type ResultErrBuilder<T> = T extends Result<Fragment<any, any>, Fragment<infer V, infer U>>
    ? FragmentBuilder<V, U>
    : never

/**
 * @example
 * ```ts
 * const Res: ScaleEnumBuilder<Result<Fragment<null>, Fragment<string>>> =
 *   createResultBuilder('Res', Void, Str)
 * ```
 */
export function createResultBuilder<T extends Result<Fragment<any>, Fragment<any>>>(
    name: string,
    ok: ResultOkBuilder<T>,
    err: ResultErrBuilder<T>,
): ScaleEnumBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'Ok', ok],
        [1, 'Err', err],
    ]) as any
}
