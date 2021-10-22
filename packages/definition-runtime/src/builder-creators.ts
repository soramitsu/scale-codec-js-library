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
import { yieldNTimes } from '@scale-codec/util';
import { mapDecodeResult } from './util';
import { createScaleBuilder, ScaleBuilder, ScaleInstance, UnwrapScale } from './instance';

export type BuilderFn<T, U = T> = () => ScaleBuilder<T, U>;

const scaleInstanceEncode: Encode<ScaleInstance<unknown>> = (x) => x.bytes;

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

export function createStructBuilder<T>(
    name: string,
    schema: [fieldName: keyof T & string, builder: BuilderFn<any>][],
): ScaleBuilder<T, UnwrapScaleStruct<T>> {
    const decoders: StructDecoders<T> = {} as any;
    const order: (keyof T & string)[] = [];

    for (const [field, builder] of schema) {
        order.push(field);
        decoders[field] = (bytes: Uint8Array) => builder().fromBytesRaw(bytes) as any;
    }

    return createScaleBuilder(
        name,
        (val) => encodeStruct(val, proxyScaleInstanceEncodeGetters, order),
        (b) => decodeStruct(b, decoders, order),
        unwrapScaleStruct,
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

    return (
        contentUnwrapped ? Enum.valuable<any, any>(variant, contentUnwrapped[0]) : Enum.empty<any, any>(variant)
    ) as any;
}

export function createEnumBuilder<T extends Enum<any>>(
    name: string,
    schema: [discriminant: number, variantName: string, codec?: BuilderFn<any>][],
): ScaleBuilder<T, UnwrapScaleEnum<T>> {
    const encoders: EnumEncoders = {};
    const decoders: EnumDecoders = {};

    for (const [dis, name, codec] of schema) {
        encoders[name] = { d: dis, encode: codec && scaleInstanceEncode };
        decoders[dis] = {
            v: name,
            decode: codec && ((b) => codec().fromBytesRaw(b)),
        };
    }

    return createScaleBuilder(
        name,
        (value) => encodeEnum(value, encoders),
        (bytes) => decodeEnum(bytes, decoders) as DecodeResult<T>,
        unwrapScaleEnum,
    );
}

type UnwrapScaleArray<T> = T extends ScaleInstance<any, infer U>[] ? UnwrapScale<U>[] : never;

function unwrapScaleArray<T>(scale: ScaleInstance<T>): UnwrapScaleArray<T> {
    return (scale.value as unknown as ScaleInstance<any>[]).map((x) => x.unwrap()) as any;
}

export function createArrayBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemCodec: () => T extends ScaleInstance<infer V>[] ? ScaleBuilder<V> : never,
    len: number,
): ScaleBuilder<T, UnwrapScaleArray<T>> {
    return createScaleBuilder(
        name,
        (v) => encodeArray(v, scaleInstanceEncode, len),
        (b) => decodeArray(b, (x) => itemCodec().fromBytesRaw(x), len) as any,
        unwrapScaleArray as any,
    );
}

export function createVecBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemCodec: () => T extends ScaleInstance<infer V>[] ? ScaleBuilder<V> : never,
): ScaleBuilder<T, UnwrapScaleArray<T>> {
    return createScaleBuilder(
        name,
        (v) => encodeVec(v, scaleInstanceEncode),
        (b) => decodeVec(b, (x) => itemCodec().fromBytesRaw(x)) as any,
        unwrapScaleArray as any,
    );
}

type UnwrapScaleSet<T> = T extends Set<ScaleInstance<any, infer U>> ? Set<UnwrapScale<U>> : never;

function unwrapScaleSet<T>(scale: ScaleInstance<T>): UnwrapScaleSet<T> {
    return new Set([...(scale.value as any as Set<ScaleInstance<any>>)].map((x) => x.unwrap())) as any;
}

export function createSetBuilder<T extends Set<ScaleInstance<any>>>(
    name: string,
    itemCodec: () => ScaleBuilder<T extends Set<ScaleInstance<infer V>> ? V : never>,
): ScaleBuilder<T, UnwrapScaleSet<T>> {
    return createScaleBuilder(
        name,
        (value) => encodeSet(value, scaleInstanceEncode),
        (bytes) => decodeSet(bytes, (part) => itemCodec().fromBytesRaw(part)) as any,
        unwrapScaleSet as any,
    );
}

type MapKeyInner<T> = T extends Map<ScaleInstance<infer V>, ScaleInstance<any>> ? V : never;

type MapValueInner<T> = T extends Map<ScaleInstance<any>, ScaleInstance<infer V>> ? V : never;

export type UnwrapScaleMap<T extends Map<ScaleInstance<any>, ScaleInstance<any>>> = T extends Map<
    ScaleInstance<any, infer K>,
    ScaleInstance<any, infer V>
>
    ? Map<UnwrapScale<K>, UnwrapScale<V>>
    : never;

export function unwrapScaleMap<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    scale: ScaleInstance<T>,
): UnwrapScaleMap<T> {
    return new Map([...scale.value].map(([key, value]) => [key.unwrap(), value.unwrap()])) as any;
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
                (part) => key().fromBytesRaw(part),
                (part) => value().fromBytesRaw(part),
            ) as any,
        unwrapScaleMap as any,
    );
}

export function createAliasBuilder<T, U>(name: string, to: BuilderFn<T, U>): ScaleBuilder<T, U> {
    return createScaleBuilder(
        name,
        (value) => to().fromValue(value).bytes,
        (bytes) => mapDecodeResult(to().fromBytesRaw(bytes), (x) => x.value),
        (x) => to().fromValue(x.value).unwrap(),
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

export function createTupleBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    codecs: (() => ScaleBuilder<any>)[],
): ScaleBuilder<T, UnwrapScaleTuple<T>> {
    const encoders: TupleEncoders<T> = [...yieldNTimes(scaleInstanceEncode, codecs.length)] as any;

    const decoders: TupleDecoders<T> = codecs.map((x) => (part: Uint8Array) => x().fromBytesRaw(part)) as any;

    return createScaleBuilder(
        name,
        (value) => encodeTuple(value, encoders),
        (bytes) => decodeTuple(bytes, decoders),
        unwrapScaleArray as any,
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
