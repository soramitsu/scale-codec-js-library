import {
    AllowedBits,
    BigIntCodecOptions,
    decodeArray,
    decodeBigInt,
    decodeSet,
    decodeStruct,
    Encode,
    encodeArray,
    encodeBigInt,
    encodeSet,
    encodeStruct,
    JSBI,
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
} from '@scale-codec/core';
import { mapGetUnwrap, yieldNTimes } from '@scale-codec/util';
import { createScaleBuilder, ScaleBuilder, ScaleBuilderWrapper, ScaleInstance, UnwrapScale } from './instance';

export type DynBuilderFn<T, U = T> = () => ScaleBuilder<T, U>;

/**
 * Wrapper to dynamically dispatch another {@link ScaleBuilder}
 */
export class DynBuilder<T, U = T> implements ScaleBuilder<T, U> {
    public readonly fn: DynBuilderFn<T, U>;

    public constructor(dynBuilderFn: DynBuilderFn<T, U>) {
        this.fn = dynBuilderFn;
    }

    public fromBytes(bytes: Uint8Array): ScaleInstance<T, U> {
        return this.fn().fromBytes(bytes);
    }

    public fromValue(value: T): ScaleInstance<T, U> {
        return this.fn().fromValue(value);
    }

    public decodeRaw(bytes: Uint8Array): DecodeResult<ScaleInstance<T, U>> {
        return this.fn().decodeRaw(bytes);
    }

    public wrap(unwrapped: U): ScaleInstance<T, U> {
        return this.fn().wrap(unwrapped);
    }
}

/**
 * Shorter version of `new DynBuilder(fn)` (see {@link DynBuilder})
 */
export function dynBuilder<T, U = T>(fn: DynBuilderFn<T, U>): DynBuilder<T, U> {
    return new DynBuilder(fn);
}

const scaleInstanceEncode: Encode<ScaleInstance<unknown>> = (x) => {
    if (!(x instanceof ScaleInstance)) {
        throw new Error(`expected ScaleInstance; actually: ${x}`);
    }
    return x.bytes;
};

const proxyScaleInstanceEncodeGetters: StructEncoders<any> = new Proxy(
    {},
    {
        get: () => scaleInstanceEncode,
    },
) as any;

export function createBigIntBuilder(name: string, bits: AllowedBits, signed: boolean): ScaleBuilder<JSBI> {
    const opts: BigIntCodecOptions = { bits, signed, endianness: 'le' };

    return createScaleBuilder<JSBI>(
        name,
        (v) => encodeBigInt(v, opts),
        (b) => decodeBigInt(b, opts),
    );
}

export type UnwrapScaleStruct<T> = {
    [K in keyof T]: UnwrapScale<T[K]>;
};

function unwrapScaleStruct<T>(scale: ScaleInstance<T, UnwrapScaleStruct<T>>): UnwrapScaleStruct<T> {
    return Object.fromEntries(Object.entries(scale.value).map(([key, item]) => [key, item.unwrap()])) as any;
}

function createScaleStructWrapper<T>(schema: StructBuilderSchema<T>): ScaleBuilderWrapper<T, UnwrapScaleStruct<T>> {
    return (raw) => {
        const inner: T = {} as any;

        for (const [field, builder] of schema) {
            (inner as any)[field] = builder.wrap(raw[field]);
        }

        return inner;
    };
}

export type StructBuilderSchema<T> = [fieldName: keyof T & string, builder: ScaleBuilder<any>][];

/**
 * Defines builder for struct which fields (in wrapped state) are `ScaleInstance`s
 */
export type ScaleStructBuilder<T extends { [K in keyof T]: ScaleInstance<any> }> = ScaleBuilder<
    T,
    UnwrapScaleStruct<T>
>;

/**
 * @remarks
 *
 * To make it type-safe, you may use this syntax:
 *
 * ```ts
 * const Account: ScaleStructBuilder<{
 *   name: ScaleInstance<string>
 *   // extract the type from another builder
 *   second_name: InstanceViaBuilder<typeof Str>
 * }> = createStructBuilder('Account', [['name', Str], ['second_name', Str]])
 * ```
 */
export function createStructBuilder<T extends { [K in keyof T]: ScaleInstance<any> }>(
    name: string,
    schema: StructBuilderSchema<T>,
): ScaleStructBuilder<T> {
    const decoders: StructDecoders<T> = {} as any;
    const order: (keyof T & string)[] = [];

    for (const [field, builder] of schema) {
        order.push(field);
        decoders[field] = (bytes: Uint8Array) => builder.decodeRaw(bytes) as any;
    }

    return createScaleBuilder(
        name,
        (value: T) => encodeStruct<T>(value, proxyScaleInstanceEncodeGetters, order),
        (bytes) => decodeStruct(bytes, decoders, order),
        unwrapScaleStruct,
        createScaleStructWrapper<T>(schema),
    );
}

export type UnwrapScaleEnum<T extends Enum<any>> = T extends Enum<infer Def>
    ? Enum<{
          [K in keyof Def]: Def[K] extends Valuable<infer I>
              ? I extends ScaleInstance<any, infer U>
                  ? Valuable<U>
                  : never
              : null;
      }>
    : never;

function unwrapScaleEnum<T extends Enum<any>>(scale: ScaleInstance<T, any>): UnwrapScaleEnum<T> {
    const { content, tag } = scale.value;
    let contentUnwrapped: null | [any] = null;

    if (content && content[0] instanceof ScaleInstance) {
        contentUnwrapped = [content[0].unwrap()];
    }

    return (contentUnwrapped ? Enum.valuable<any, any>(tag, contentUnwrapped[0]) : Enum.empty<any>(tag)) as any;
}

export type EnumBuilderSchema = [discriminant: number, variantName: string, builder?: ScaleBuilder<any>][];

function createScaleEnumWrapper<T extends Enum<any>>(
    schema: EnumBuilderSchema,
): ScaleBuilderWrapper<T, UnwrapScaleEnum<T>> {
    const wrappers = new Map<string, ScaleBuilder<any>>();

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

export type ScaleEnumBuilder<T extends Enum<any>> = ScaleBuilder<T, UnwrapScaleEnum<T>>;

/**
 * @example
 * ```ts
 * const Message: ScaleEnumBuilder<Enum<{
 *   Quit: null
 *   Greeting: Valuable<ScaleInstance<string>>
 * }>> = createEnumBuilder('Message', [[0, 'Quit'], [1, 'Greeting', Str]])
 * ```
 */
export function createEnumBuilder<T extends Enum<any>>(name: string, schema: EnumBuilderSchema): ScaleEnumBuilder<T> {
    const encoders: EnumEncoders = {};
    const decoders: EnumDecoders = {};

    for (const [dis, name, codec] of schema) {
        encoders[name] = { d: dis, encode: codec && scaleInstanceEncode };
        decoders[dis] = {
            v: name,
            decode: codec && ((b) => codec.decodeRaw(b)),
        };
    }

    return createScaleBuilder(
        name,
        (value) => encodeEnum(value, encoders),
        (bytes) => decodeEnum(bytes, decoders) as DecodeResult<T>,
        unwrapScaleEnum,
        createScaleEnumWrapper(schema),
    );
}

type UnwrapScaleArray<T> = T extends ScaleInstance<any, infer U>[] ? UnwrapScale<U>[] : never;

function unwrapScaleArray<T>(scale: ScaleInstance<T>): UnwrapScaleArray<T> {
    return (scale.value as unknown as ScaleInstance<any>[]).map((x) => x.unwrap()) as any;
}

function createScaleArrayWrapper<T>(builder: ArrayItemBuilder<T>): ScaleBuilderWrapper<T, UnwrapScaleArray<T>> {
    const mapper = (x: any): ScaleInstance<any> => builder.wrap(x);

    return (rawArray) => {
        return rawArray.map(mapper) as any;
    };
}

export type ArrayItemBuilder<T> = T extends ScaleInstance<infer V, infer U>[] ? ScaleBuilder<V, U> : never;

export type ScaleArrayBuilder<T extends ScaleInstance<any>[]> = ScaleBuilder<T, UnwrapScaleArray<T>>;

/**
 * @example
 * ```ts
 * const Array_u32_l5: ScaleArrayBuilder<InstanceViaBuilder<typeof U32>[]> =
 *   createArrayBuilder('Array_u32_l5', U32, 5)
 * ```
 */
export function createArrayBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemBuilder: ArrayItemBuilder<T>,
    len: number,
): ScaleArrayBuilder<T> {
    return createScaleBuilder(
        name,
        (v) => encodeArray(v, scaleInstanceEncode, len),
        (b) => decodeArray(b, (x) => itemBuilder.decodeRaw(x), len) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    );
}

/**
 * @example
 * ```ts
 * const VecU32: ScaleArrayBuilder<InstanceViaBuilder<typeof U32>[]> =
 *   createArrayBuilder('VecU32', U32)
 * ```
 */
export function createVecBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemBuilder: ArrayItemBuilder<T>,
): ScaleArrayBuilder<T> {
    return createScaleBuilder(
        name,
        (v) => encodeVec(v, scaleInstanceEncode),
        (b) => decodeVec(b, (x) => itemBuilder.decodeRaw(x)) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(itemBuilder),
    );
}

type UnwrapScaleSet<T> = T extends Set<ScaleInstance<any, infer U>> ? Set<UnwrapScale<U>> : never;

function unwrapScaleSet<T>(scale: ScaleInstance<T>): UnwrapScaleSet<T> {
    return new Set([...(scale.value as any as Set<ScaleInstance<any>>)].map((x) => x.unwrap())) as any;
}

function createScaleSetWrapper<T>(builder: SetEntryBuilder<T>): ScaleBuilderWrapper<T, UnwrapScaleSet<T>> {
    return (raw) => new Set([...raw].map((x) => builder.wrap(x))) as any;
}

type SetEntryBuilder<T> = T extends Set<ScaleInstance<infer V>> ? ScaleBuilder<V> : never;

export type ScaleSetBuilder<T extends Set<ScaleInstance<any>>> = ScaleBuilder<T, UnwrapScaleSet<T>>;

/**
 * @example
 * ```ts
 * const SetU32: ScaleSetBuilder<Set<InstanceViaBuilder<typeof U32>>> =
 *   createSetBuilder('SetU32', U32)
 * ```
 */
export function createSetBuilder<T extends Set<ScaleInstance<any>>>(
    name: string,
    entryBuilder: SetEntryBuilder<T>,
): ScaleSetBuilder<T> {
    return createScaleBuilder(
        name,
        (value) => encodeSet(value, scaleInstanceEncode),
        (bytes) => decodeSet(bytes, (part) => entryBuilder.decodeRaw(part)) as any,
        unwrapScaleSet as any,
        createScaleSetWrapper(entryBuilder),
    );
}

type MapKeyInner<T> = T extends Map<ScaleInstance<infer V>, ScaleInstance<any>> ? V : never;

type MapValueInner<T> = T extends Map<ScaleInstance<any>, ScaleInstance<infer V>> ? V : never;

export type UnwrapScaleMap<T> = T extends Map<ScaleInstance<any, infer K>, ScaleInstance<any, infer V>>
    ? Map<UnwrapScale<K>, UnwrapScale<V>>
    : never;

function unwrapScaleMap<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    scale: ScaleInstance<T>,
): UnwrapScaleMap<T> {
    return new Map([...scale.value].map(([key, value]) => [key.unwrap(), value.unwrap()])) as any;
}

function createScaleMapWrapper<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    key: ScaleBuilder<MapKeyInner<T>>,
    value: ScaleBuilder<MapValueInner<T>>,
): ScaleBuilderWrapper<T, UnwrapScaleMap<T>> {
    return (raw) => {
        return new Map([...raw].map(([k, v]) => [key.wrap(k), value.wrap(v)])) as any;
    };
}

export type ScaleMapBuilder<T extends Map<ScaleInstance<any>, ScaleInstance<any>>> = ScaleBuilder<T, UnwrapScaleMap<T>>;

/**
 * @example
 * ```ts
 * const MapStrBool: ScaleMapBuilder<Map<InstanceViaBuilder<typeof Str>, InstanceViaBuilder<typeof Bool>>> =
 *   createMapBuilder('MapStrBool', Str, Bool)
 * ```
 */
export function createMapBuilder<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    keyBuilder: ScaleBuilder<MapKeyInner<T>>,
    valueBuilder: ScaleBuilder<MapValueInner<T>>,
): ScaleMapBuilder<T> {
    return createScaleBuilder(
        name,
        (value) => encodeMap(value, scaleInstanceEncode, scaleInstanceEncode),
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
export function createAliasBuilder<T, U>(name: string, to: ScaleBuilder<T, U>): ScaleBuilder<T, U> {
    return createScaleBuilder(
        name,
        (value) => to.fromValue(value).bytes,
        (bytes) => mapDecodeResult(to.decodeRaw(bytes), (x) => x.value),
        (value) => to.fromValue(value.value).unwrap(),
        (unwrapped) => to.wrap(unwrapped).value,
    );
}

export function createBytesArrayBuilder(name: string, len: number): ScaleBuilder<Uint8Array> {
    return createScaleBuilder(
        name,
        (value) => encodeUint8Array(value, len),
        (bytes) => decodeUint8Array(bytes, len),
    );
}

type UnwrapScaleTuple<T> = T extends ScaleInstance<any>[]
    ? T extends [ScaleInstance<any, infer U>, ...infer Tail]
        ? [UnwrapScale<U>, ...UnwrapScaleTuple<Tail>]
        : []
    : never;

function createScaleTupleWrapper<T>(builder: ScaleBuilder<any>[]): ScaleBuilderWrapper<T, UnwrapScaleTuple<T>> {
    return (raw) => raw.map((x, i) => builder[i].wrap(x)) as any;
}

export type ScaleTupleBuilder<T> = ScaleBuilder<T, UnwrapScaleTuple<T>>;

/**
 * @example
 * ```ts
 * const U32_U32: ScaleTupleBuilder<[InstanceViaBuilder<typeof U32>, InstanceViaBuilder<typeof U32>]> =
 *   createTupleBuilder('U32_U32', [U32, U32])
 * ```
 */
export function createTupleBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    builders: ScaleBuilder<any>[],
): ScaleTupleBuilder<T> {
    const encoders: TupleEncoders<T> = [...yieldNTimes(scaleInstanceEncode, builders.length)] as any;

    const decoders: TupleDecoders<T> = builders.map((x) => (part: Uint8Array) => x.decodeRaw(part)) as any;

    return createScaleBuilder(
        name,
        (value) => encodeTuple(value, encoders),
        (bytes) => decodeTuple(bytes, decoders),
        unwrapScaleArray as any,
        createScaleTupleWrapper(builders),
    );
}

type OptionBuilder<T> = T extends Option<ScaleInstance<infer V, infer U>> ? ScaleBuilder<V, U> : never;

/**
 * @example
 * ```ts
 * const OptionStr: ScaleEnumBuilder<Option<InstanceViaBuilder<typeof Str>>> =
 *   createOptionBuilder('OptionStr', Str)
 * ```
 */
export function createOptionBuilder<T extends Option<ScaleInstance<any>>>(
    name: string,
    some: OptionBuilder<T>,
): ScaleEnumBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'None'],
        [1, 'Some', some],
    ]);
}

type ResultOkBuilder<T> = T extends Result<ScaleInstance<infer V, infer U>, ScaleInstance<any, any>>
    ? ScaleBuilder<V, U>
    : never;

type ResultErrBuilder<T> = T extends Result<ScaleInstance<any, any>, ScaleInstance<infer V, infer U>>
    ? ScaleBuilder<V, U>
    : never;

/**
 * @example
 * ```ts
 * const Res: ScaleEnumBuilder<Result<ScaleInstance<null>, ScaleInstance<string>>> =
 *   createResultBuilder('Res', Void, Str)
 * ```
 */
export function createResultBuilder<T extends Result<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    ok: ResultOkBuilder<T>,
    err: ResultErrBuilder<T>,
): ScaleEnumBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'Ok', ok],
        [1, 'Err', err],
    ]);
}
