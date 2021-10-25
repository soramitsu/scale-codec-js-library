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
} from '@scale-codec/core';
import { mapGetUnwrap, yieldNTimes } from '@scale-codec/util';
import { mapDecodeResult } from './util';
import { createScaleBuilder, ScaleBuilder, ScaleBuilderWrapper, ScaleInstance, UnwrapScale } from './instance';

export type BuilderFn<T, U = T> = () => ScaleBuilder<T, U>;

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

type UnwrapScaleStruct<T> = {
    [K in keyof T]: UnwrapScale<T[K]>;
};

function unwrapScaleStruct<T>(scale: ScaleInstance<T, UnwrapScaleStruct<T>>): UnwrapScaleStruct<T> {
    return Object.fromEntries(Object.entries(scale.value).map(([key, item]) => [key, item.unwrap()])) as any;
}

function createScaleStructWrapper<T>(schema: StructBuilderSchema<T>): ScaleBuilderWrapper<T, UnwrapScaleStruct<T>> {
    return (raw) => {
        const inner: T = {} as any;

        for (const [field, builder] of schema) {
            (inner as any)[field] = builder().wrap(raw[field]);
        }

        return inner;
    };
}

export type StructBuilderSchema<T> = [fieldName: keyof T & string, builder: BuilderFn<any>][];

export function createStructBuilder<T>(
    name: string,
    schema: StructBuilderSchema<T>,
): ScaleBuilder<T, UnwrapScaleStruct<T>> {
    const decoders: StructDecoders<T> = {} as any;
    const order: (keyof T & string)[] = [];

    for (const [field, builder] of schema) {
        order.push(field);
        decoders[field] = (bytes: Uint8Array) => builder().decodeRaw(bytes) as any;
    }

    return createScaleBuilder(
        name,
        (val) => encodeStruct(val, proxyScaleInstanceEncodeGetters, order),
        (b) => decodeStruct(b, decoders, order),
        unwrapScaleStruct,
        createScaleStructWrapper(schema),
    );
}

type UnwrapScaleEnum<T extends Enum<any>> = T extends Enum<infer Def>
    ? Enum<{
          [K in keyof Def]: Def[K] extends Valuable<infer I>
              ? I extends ScaleInstance<any, infer U>
                  ? Valuable<U>
                  : never
              : null;
      }>
    : never;

function unwrapScaleEnum<T extends Enum<any>>(scale: ScaleInstance<T, any>): UnwrapScaleEnum<T> {
    const { content, variant } = scale.value;
    let contentUnwrapped: null | [any] = null;

    if (content && content[0] instanceof ScaleInstance) {
        contentUnwrapped = [content[0].unwrap()];
    }

    return (contentUnwrapped ? Enum.valuable<any, any>(variant, contentUnwrapped[0]) : Enum.empty<any>(variant)) as any;
}

export type EnumBuilderSchema = [discriminant: number, variantName: string, builder?: BuilderFn<any>][];

function createScaleEnumWrapper<T extends Enum<any>>(
    schema: EnumBuilderSchema,
): ScaleBuilderWrapper<T, UnwrapScaleEnum<T>> {
    const wrappers = new Map<string, BuilderFn<any>>();

    for (const [, name, builderFn] of schema) {
        builderFn && wrappers.set(name, builderFn);
    }

    return ({ variant, content }) => {
        if (content) {
            const builder = mapGetUnwrap(wrappers, variant)();
            return Enum.valuable<any, any>(variant, builder.wrap(content[0]));
        }
        return Enum.empty<any>(variant as any) as any;
    };
}

export function createEnumBuilder<T extends Enum<any>>(
    name: string,
    schema: EnumBuilderSchema,
): ScaleBuilder<T, UnwrapScaleEnum<T>> {
    const encoders: EnumEncoders = {};
    const decoders: EnumDecoders = {};

    for (const [dis, name, codec] of schema) {
        encoders[name] = { d: dis, encode: codec && scaleInstanceEncode };
        decoders[dis] = {
            v: name,
            decode: codec && ((b) => codec().decodeRaw(b)),
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

function createScaleArrayWrapper<T>(builder: ArrayBuilderItemBuilder<T>): ScaleBuilderWrapper<T, UnwrapScaleArray<T>> {
    const mapper = (x: any): ScaleInstance<any> => builder().wrap(x);

    return (rawArray) => {
        return rawArray.map(mapper) as any;
    };
}

export type ArrayBuilderItemBuilder<T> = T extends ScaleInstance<infer V>[] ? BuilderFn<V> : never;

export function createArrayBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    builder: ArrayBuilderItemBuilder<T>,
    len: number,
): ScaleBuilder<T, UnwrapScaleArray<T>> {
    return createScaleBuilder(
        name,
        (v) => encodeArray(v, scaleInstanceEncode, len),
        (b) => decodeArray(b, (x) => builder().decodeRaw(x), len) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(builder),
    );
}

export function createVecBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    builder: ArrayBuilderItemBuilder<T>,
): ScaleBuilder<T, UnwrapScaleArray<T>> {
    return createScaleBuilder(
        name,
        (v) => encodeVec(v, scaleInstanceEncode),
        (b) => decodeVec(b, (x) => builder().decodeRaw(x)) as any,
        unwrapScaleArray as any,
        createScaleArrayWrapper(builder),
    );
}

type UnwrapScaleSet<T> = T extends Set<ScaleInstance<any, infer U>> ? Set<UnwrapScale<U>> : never;

function unwrapScaleSet<T>(scale: ScaleInstance<T>): UnwrapScaleSet<T> {
    return new Set([...(scale.value as any as Set<ScaleInstance<any>>)].map((x) => x.unwrap())) as any;
}

function createScaleSetWrapper<T>(builder: ScaleSetBuilderFn<T>): ScaleBuilderWrapper<T, UnwrapScaleSet<T>> {
    return (raw) => new Set([...raw].map((x) => builder().wrap(x))) as any;
}

type ScaleSetBuilderFn<T> = T extends Set<ScaleInstance<infer V>> ? BuilderFn<V> : never;

export function createSetBuilder<T extends Set<ScaleInstance<any>>>(
    name: string,
    builder: ScaleSetBuilderFn<T>,
): ScaleBuilder<T, UnwrapScaleSet<T>> {
    return createScaleBuilder(
        name,
        (value) => encodeSet(value, scaleInstanceEncode),
        (bytes) => decodeSet(bytes, (part) => builder().decodeRaw(part)) as any,
        unwrapScaleSet as any,
        createScaleSetWrapper(builder),
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
    key: BuilderFn<MapKeyInner<T>>,
    value: BuilderFn<MapValueInner<T>>,
): ScaleBuilderWrapper<T, UnwrapScaleMap<T>> {
    return (raw) => {
        return new Map([...raw].map(([k, v]) => [key().wrap(k), value().wrap(v)])) as any;
    };
}

export function createMapBuilder<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    key: BuilderFn<MapKeyInner<T>>,
    value: BuilderFn<MapValueInner<T>>,
): ScaleBuilder<T, UnwrapScaleMap<T>> {
    return createScaleBuilder(
        name,
        (value) => encodeMap(value, scaleInstanceEncode, scaleInstanceEncode),
        (bytes) =>
            decodeMap(
                bytes,
                (part) => key().decodeRaw(part),
                (part) => value().decodeRaw(part),
            ) as any,
        unwrapScaleMap as any,
        createScaleMapWrapper(key, value),
    );
}

export function createAliasBuilder<T, U>(name: string, to: BuilderFn<T, U>): ScaleBuilder<T, U> {
    return createScaleBuilder(
        name,
        (value) => to().fromValue(value).bytes,
        (bytes) => mapDecodeResult(to().decodeRaw(bytes), (x) => x.value),
        (value) => to().fromValue(value.value).unwrap(),
        (unwrapped) => to().wrap(unwrapped).value,
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

function createScaleTupleWrapper<T>(builder: BuilderFn<any>[]): ScaleBuilderWrapper<T, UnwrapScaleTuple<T>> {
    return (raw) => raw.map((x, i) => builder[i]().wrap(x)) as any;
}

export function createTupleBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    builders: BuilderFn<any>[],
): ScaleBuilder<T, UnwrapScaleTuple<T>> {
    const encoders: TupleEncoders<T> = [...yieldNTimes(scaleInstanceEncode, builders.length)] as any;

    const decoders: TupleDecoders<T> = builders.map((x) => (part: Uint8Array) => x().decodeRaw(part)) as any;

    return createScaleBuilder(
        name,
        (value) => encodeTuple(value, encoders),
        (bytes) => decodeTuple(bytes, decoders),
        unwrapScaleArray as any,
        createScaleTupleWrapper(builders),
    );
}

type OptionBuilder<T> = T extends Option<ScaleInstance<infer V, infer U>> ? BuilderFn<V, U> : never;

export function createOptionBuilder<T extends Option<ScaleInstance<any>>>(
    name: string,
    some: OptionBuilder<T>,
): ScaleBuilder<T, UnwrapScaleEnum<T>> {
    return createEnumBuilder(name, [
        [0, 'None'],
        [1, 'Some', some],
    ]);
}

type ResultOkBuilder<T> = T extends Result<ScaleInstance<infer V, infer U>, ScaleInstance<any, any>>
    ? BuilderFn<V, U>
    : never;

type ResultErrBuilder<T> = T extends Result<ScaleInstance<any, any>, ScaleInstance<infer V, infer U>>
    ? BuilderFn<V, U>
    : never;

export function createResultBuilder<T extends Result<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    ok: ResultOkBuilder<T>,
    err: ResultErrBuilder<T>,
): ScaleBuilder<T, UnwrapScaleEnum<T>> {
    return createEnumBuilder(name, [
        [0, 'Ok', ok],
        [1, 'Err', err],
    ]);
}
