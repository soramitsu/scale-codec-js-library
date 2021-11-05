import {
    decodeArray,
    decodeBigInt,
    decodeSet,
    decodeStruct,
    Encode,
    encodeArray,
    encodeBigInt,
    encodeSet,
    encodeStruct,
    StructEncoders,
    TupleEncoders,
    Enum,
    encodeEnum,
    decodeEnum,
    encodeMap,
    decodeMap,
    StructDecoders,
    EnumEncoders,
    EnumDecoders,
    DecodeResult,
    encodeVec,
    decodeVec,
    encodeUint8Array,
    decodeUint8Array,
    encodeTuple,
    decodeTuple,
    TupleDecoders,
    Option,
    Result,
    Valuable,
    mapDecodeResult,
    BigIntTypes,
    IntTypes,
    encodeInt,
    decodeInt,
} from '@scale-codec/core';
import { mapGetUnwrap, yieldNTimes } from '@scale-codec/util';
import { createBuilder, FragmentBuilder, FragmentWrapFn, Fragment, UnwrapFragment } from './fragment';

export type DynBuilderFn<T, U = T> = () => FragmentBuilder<T, U>;

/**
 * Wrapper to dynamically dispatch another {@link FragmentBuilder}
 */
export class DynBuilder<T, U = T> implements FragmentBuilder<T, U> {
    public readonly fn: DynBuilderFn<T, U>;

    public constructor(dynBuilderFn: DynBuilderFn<T, U>) {
        this.fn = dynBuilderFn;
    }

    public fromBytes(bytes: Uint8Array): Fragment<T, U> {
        return this.fn().fromBytes(bytes);
    }

    public fromValue(value: T): Fragment<T, U> {
        return this.fn().fromValue(value);
    }

    public decodeRaw(bytes: Uint8Array): DecodeResult<Fragment<T, U>> {
        return this.fn().decodeRaw(bytes);
    }

    public wrap(unwrapped: U): Fragment<T, U> {
        return this.fn().wrap(unwrapped);
    }
}

/**
 * Shorter version of `new DynBuilder(fn)` (see {@link DynBuilder})
 */
export function dynBuilder<T, U = T>(fn: DynBuilderFn<T, U>): DynBuilder<T, U> {
    return new DynBuilder(fn);
}

const fragmentEncode: Encode<Fragment<unknown>> = (x) => {
    if (!(x instanceof Fragment)) {
        throw new Error(`expected Fragment; actually: ${x}`);
    }
    return x.bytes;
};

const proxyFragmentEncodeGetters: StructEncoders<any> = new Proxy(
    {},
    {
        get: () => fragmentEncode,
    },
) as any;

export function createIntBuilder(name: string, ty: IntTypes): FragmentBuilder<number> {
    return createBuilder(
        name,
        (v) => encodeInt(v, ty),
        (b) => decodeInt(b, ty),
    );
}

export function createBigIntBuilder(name: string, ty: BigIntTypes): FragmentBuilder<bigint> {
    return createBuilder<bigint>(
        name,
        (v) => encodeBigInt(v, ty),
        (b) => decodeBigInt(b, ty),
    );
}

export type UnwrapScaleStruct<T> = {
    [K in keyof T]: UnwrapFragment<T[K]>;
};

function unwrapScaleStruct<T>(scale: Fragment<T, UnwrapScaleStruct<T>>): UnwrapScaleStruct<T> {
    return Object.fromEntries(Object.entries(scale.value).map(([key, item]) => [key, item.unwrap()])) as any;
}

function createScaleStructWrapper<T>(schema: StructBuilderSchema<T>): FragmentWrapFn<T, UnwrapScaleStruct<T>> {
    return (raw) => {
        const inner: T = {} as any;

        for (const [field, builder] of schema) {
            (inner as any)[field] = builder.wrap(raw[field]);
        }

        return inner;
    };
}

export type StructBuilderSchema<T> = [fieldName: keyof T & string, builder: FragmentBuilder<any>][];

/**
 * Defines builder for struct which fields (in wrapped state) are `Fragment`s
 */
export type ScaleStructBuilder<T extends { [K in keyof T]: Fragment<any> }> = FragmentBuilder<T, UnwrapScaleStruct<T>>;

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
    const decoders: StructDecoders<T> = {} as any;
    const order: (keyof T & string)[] = [];

    for (const [field, builder] of schema) {
        order.push(field);
        decoders[field] = (bytes: Uint8Array) => builder.decodeRaw(bytes) as any;
    }

    return createBuilder(
        name,
        (value: T) => encodeStruct<T>(value, proxyFragmentEncodeGetters, order),
        (bytes) => decodeStruct(bytes, decoders, order),
        unwrapScaleStruct,
        createScaleStructWrapper<T>(schema),
    );
}

export type UnwrapScaleEnum<T extends Enum<any>> = T extends Enum<infer Def>
    ? Enum<{
          [K in keyof Def]: Def[K] extends Valuable<infer I>
              ? I extends Fragment<any, infer U>
                  ? Valuable<U>
                  : never
              : null;
      }>
    : never;

function unwrapScaleEnum<T extends Enum<any>>(scale: Fragment<T, any>): UnwrapScaleEnum<T> {
    const { content, tag } = scale.value;
    let contentUnwrapped: null | [any] = null;

    if (content && content[0] instanceof Fragment) {
        contentUnwrapped = [content[0].unwrap()];
    }

    return (contentUnwrapped ? Enum.valuable<any, any>(tag, contentUnwrapped[0]) : Enum.empty<any>(tag)) as any;
}

export type EnumBuilderSchema = [discriminant: number, variantName: string, builder?: FragmentBuilder<any>][];

function createScaleEnumWrapper<T extends Enum<any>>(schema: EnumBuilderSchema): FragmentWrapFn<T, UnwrapScaleEnum<T>> {
    const wrappers = new Map<string, FragmentBuilder<any>>();

    for (const [, name, builderFn] of schema) {
        builderFn && wrappers.set(name, builderFn);
    }

    return ({ tag, content }) => {
        if (content) {
            const builder = mapGetUnwrap(wrappers, tag);
            return Enum.valuable<any, any>(tag, builder.wrap(content[0]));
        }
        return Enum.empty<any>(tag as any) as any;
    };
}

export type ScaleEnumBuilder<T extends Enum<any>> = FragmentBuilder<T, UnwrapScaleEnum<T>>;

/**
 * @example
 * ```ts
 * const Message: ScaleEnumBuilder<Enum<{
 *   Quit: null
 *   Greeting: Valuable<Fragment<string>>
 * }>> = createEnumBuilder('Message', [[0, 'Quit'], [1, 'Greeting', Str]])
 * ```
 */
export function createEnumBuilder<T extends Enum<any>>(name: string, schema: EnumBuilderSchema): ScaleEnumBuilder<T> {
    const encoders: EnumEncoders = {};
    const decoders: EnumDecoders = {};

    for (const [dis, name, codec] of schema) {
        encoders[name] = { d: dis, encode: codec && fragmentEncode };
        decoders[dis] = {
            v: name,
            decode: codec && ((b) => codec.decodeRaw(b)),
        };
    }

    return createBuilder(
        name,
        (value) => encodeEnum(value, encoders),
        (bytes) => decodeEnum(bytes, decoders) as DecodeResult<T>,
        unwrapScaleEnum,
        createScaleEnumWrapper(schema),
    );
}

type UnwrapScaleArray<T> = T extends Fragment<any, infer U>[] ? UnwrapFragment<U>[] : never;

function unwrapScaleArray<T>(scale: Fragment<T>): UnwrapScaleArray<T> {
    return (scale.value as unknown as Fragment<any>[]).map((x) => x.unwrap()) as any;
}

function createScaleArrayWrapper<T>(builder: ArrayItemBuilder<T>): FragmentWrapFn<T, UnwrapScaleArray<T>> {
    const mapper = (x: any): Fragment<any> => builder.wrap(x);

    return (rawArray) => {
        return rawArray.map(mapper) as any;
    };
}

export type ArrayItemBuilder<T> = T extends Fragment<infer V, infer U>[] ? FragmentBuilder<V, U> : never;

export type ScaleArrayBuilder<T extends Fragment<any>[]> = FragmentBuilder<T, UnwrapScaleArray<T>>;

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
    return createBuilder(
        name,
        (v) => encodeArray(v, fragmentEncode, len),
        (b) => decodeArray(b, (x) => itemBuilder.decodeRaw(x), len) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    );
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
    return createBuilder(
        name,
        (v) => encodeVec(v, fragmentEncode),
        (b) => decodeVec(b, (x) => itemBuilder.decodeRaw(x)) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    );
}

type UnwrapScaleSet<T> = T extends Set<Fragment<any, infer U>> ? Set<UnwrapFragment<U>> : never;

function unwrapScaleSet<T>(scale: Fragment<T>): UnwrapScaleSet<T> {
    return new Set([...(scale.value as any as Set<Fragment<any>>)].map((x) => x.unwrap())) as any;
}

function createScaleSetWrapper<T>(builder: SetEntryBuilder<T>): FragmentWrapFn<T, UnwrapScaleSet<T>> {
    return (raw) => new Set([...raw].map((x) => builder.wrap(x))) as any;
}

type SetEntryBuilder<T> = T extends Set<Fragment<infer V>> ? FragmentBuilder<V> : never;

export type ScaleSetBuilder<T extends Set<Fragment<any>>> = FragmentBuilder<T, UnwrapScaleSet<T>>;

/**
 * @example
 * ```ts
 * const SetU32: ScaleSetBuilder<Set<FragmentFromBuilder<typeof U32>>> =
 *   createSetBuilder('SetU32', U32)
 * ```
 */
export function createSetBuilder<T extends Set<Fragment<any>>>(
    name: string,
    entryBuilder: SetEntryBuilder<T>,
): ScaleSetBuilder<T> {
    return createBuilder(
        name,
        (value) => encodeSet(value, fragmentEncode),
        (bytes) => decodeSet(bytes, (part) => entryBuilder.decodeRaw(part)) as any,
        unwrapScaleSet as any,
        createScaleSetWrapper(entryBuilder),
    );
}

type MapKeyInner<T> = T extends Map<Fragment<infer V>, Fragment<any>> ? V : never;

type MapValueInner<T> = T extends Map<Fragment<any>, Fragment<infer V>> ? V : never;

export type UnwrapScaleMap<T> = T extends Map<Fragment<any, infer K>, Fragment<any, infer V>>
    ? Map<UnwrapFragment<K>, UnwrapFragment<V>>
    : never;

function unwrapScaleMap<T extends Map<Fragment<any>, Fragment<any>>>(scale: Fragment<T>): UnwrapScaleMap<T> {
    return new Map([...scale.value].map(([key, value]) => [key.unwrap(), value.unwrap()])) as any;
}

function createScaleMapWrapper<T extends Map<Fragment<any>, Fragment<any>>>(
    key: FragmentBuilder<MapKeyInner<T>>,
    value: FragmentBuilder<MapValueInner<T>>,
): FragmentWrapFn<T, UnwrapScaleMap<T>> {
    return (raw) => {
        return new Map([...raw].map(([k, v]) => [key.wrap(k), value.wrap(v)])) as any;
    };
}

export type ScaleMapBuilder<T extends Map<Fragment<any>, Fragment<any>>> = FragmentBuilder<T, UnwrapScaleMap<T>>;

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
        (value) => encodeMap(value, fragmentEncode, fragmentEncode),
        (bytes) =>
            decodeMap(
                bytes,
                (part) => keyBuilder.decodeRaw(part),
                (part) => valueBuilder.decodeRaw(part),
            ) as any,
        unwrapScaleMap as any,
        createScaleMapWrapper(keyBuilder, valueBuilder),
    );
}

/**
 * @example
 * ```ts
 * const StrAlias: typeof Str = createAliasBuilder('StrAlias', Str)
 * ```
 */
export function createAliasBuilder<T, U>(name: string, to: FragmentBuilder<T, U>): FragmentBuilder<T, U> {
    return createBuilder(
        name,
        (value) => to.fromValue(value).bytes,
        (bytes) => mapDecodeResult(to.decodeRaw(bytes), (x) => x.value),
        (value) => to.fromValue(value.value).unwrap(),
        (unwrapped) => to.wrap(unwrapped).value,
    );
}

export function createBytesArrayBuilder(name: string, len: number): FragmentBuilder<Uint8Array> {
    return createBuilder(
        name,
        (value) => encodeUint8Array(value, len),
        (bytes) => decodeUint8Array(bytes, len),
    );
}

type UnwrapScaleTuple<T> = T extends Fragment<any>[]
    ? T extends [Fragment<any, infer U>, ...infer Tail]
        ? [UnwrapFragment<U>, ...UnwrapScaleTuple<Tail>]
        : []
    : never;

function createScaleTupleWrapper<T>(builder: FragmentBuilder<any>[]): FragmentWrapFn<T, UnwrapScaleTuple<T>> {
    return (raw) => raw.map((x, i) => builder[i].wrap(x)) as any;
}

export type ScaleTupleBuilder<T> = FragmentBuilder<T, UnwrapScaleTuple<T>>;

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
    const encoders: TupleEncoders<T> = [...yieldNTimes(fragmentEncode, builders.length)] as any;

    const decoders: TupleDecoders<T> = builders.map((x) => (part: Uint8Array) => x.decodeRaw(part)) as any;

    return createBuilder(
        name,
        (value) => encodeTuple(value, encoders),
        (bytes) => decodeTuple(bytes, decoders),
        unwrapScaleArray as any,
        createScaleTupleWrapper(builders),
    );
}

type OptionBuilder<T> = T extends Option<Fragment<infer V, infer U>> ? FragmentBuilder<V, U> : never;

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
    ]);
}

type ResultOkBuilder<T> = T extends Result<Fragment<infer V, infer U>, Fragment<any, any>>
    ? FragmentBuilder<V, U>
    : never;

type ResultErrBuilder<T> = T extends Result<Fragment<any, any>, Fragment<infer V, infer U>>
    ? FragmentBuilder<V, U>
    : never;

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
    ]);
}
