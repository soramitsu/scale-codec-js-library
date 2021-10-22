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
} from '@scale-codec/core';
import { yieldNTimes } from '@scale-codec/util';
import { mapDecodeResult } from './util';
import { createScaleBuilder, ScaleBuilder, ScaleInstance } from './instance';

export type BuilderFn<T> = () => ScaleBuilder<T>;

const scaleInstanceEncode: Encode<ScaleInstance<unknown>> = (x) => x.bytes;

const proxyScaleInstanceEncodeGetters: StructEncoders<any> = new Proxy(
    {},
    {
        get: () => scaleInstanceEncode,
    },
) as any;

// const proxyScaleInstanceTupleEncoders: TupleEncoders<any> = new Proxy({}, { get(tg, p) {} }) as any

export function createBigIntBuilder(name: string, bits: AllowedBits, signed: boolean): ScaleBuilder<JSBI> {
    const opts: BigIntCodecOptions = { bits, signed, endianness: 'le' };

    return createScaleBuilder<JSBI>(
        name,
        (v) => encodeBigInt(v, opts),
        (b) => decodeBigInt(b, opts),
    );
}

export function createStructBuilder<T>(
    name: string,
    schema: [fieldName: keyof T & string, builder: BuilderFn<any>][],
): ScaleBuilder<T> {
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
    );
}

export function createEnumBuilder<T extends Enum<any>>(
    name: string,
    schema: [discriminant: number, variantName: string, codec?: BuilderFn<any>][],
): ScaleBuilder<T> {
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
    );
}

export function createArrayBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemCodec: () => T extends ScaleInstance<infer V>[] ? ScaleBuilder<V> : never,
    len: number,
): ScaleBuilder<T> {
    return createScaleBuilder(
        name,
        (v) => encodeArray(v, scaleInstanceEncode, len),
        (b) => decodeArray(b, (x) => itemCodec().fromBytesRaw(x), len) as any,
    );
}

export function createVecBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    itemCodec: () => T extends ScaleInstance<infer V>[] ? ScaleBuilder<V> : never,
): ScaleBuilder<T> {
    return createScaleBuilder(
        name,
        (v) => encodeVec(v, scaleInstanceEncode),
        (b) => decodeVec(b, (x) => itemCodec().fromBytesRaw(x)) as any,
    );
}

export function createSetBuilder<T extends Set<ScaleInstance<any>>>(
    name: string,
    itemCodec: () => ScaleBuilder<T extends Set<ScaleInstance<infer V>> ? V : never>,
): ScaleBuilder<T> {
    return createScaleBuilder(
        name,
        (value) => encodeSet(value, scaleInstanceEncode),
        (bytes) => decodeSet(bytes, (part) => itemCodec().fromBytesRaw(part)) as any,
    );
}

type MapKeyInner<T> = T extends Map<ScaleInstance<infer V>, ScaleInstance<any>> ? V : never;

type MapValueInner<T> = T extends Map<ScaleInstance<any>, ScaleInstance<infer V>> ? V : never;

export function createMapBuilder<T extends Map<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    key: BuilderFn<MapKeyInner<T>>,
    value: BuilderFn<MapValueInner<T>>,
): ScaleBuilder<T> {
    return createScaleBuilder(
        name,
        (value) => encodeMap(value, scaleInstanceEncode, scaleInstanceEncode),
        (bytes) =>
            decodeMap(
                bytes,
                (part) => key().fromBytesRaw(part),
                (part) => value().fromBytesRaw(part),
            ) as any,
    );
}

export function createAliasBuilder<T>(name: string, to: () => ScaleBuilder<T>): ScaleBuilder<T> {
    return createScaleBuilder(
        name,
        (value) => to().fromValue(value).bytes,
        (bytes) => mapDecodeResult(to().fromBytesRaw(bytes), (x) => x.value),
    );
}

export function createBytesArrayBuilder(name: string, len: number): ScaleBuilder<Uint8Array> {
    return createScaleBuilder(
        name,
        (value) => encodeUint8Array(value, len),
        (bytes) => decodeUint8Array(bytes, len),
    );
}

export function createTupleBuilder<T extends ScaleInstance<any>[]>(
    name: string,
    codecs: (() => ScaleBuilder<any>)[],
): ScaleBuilder<T> {
    const encoders: TupleEncoders<T> = [...yieldNTimes(scaleInstanceEncode, codecs.length)] as any;

    const decoders: TupleDecoders<T> = codecs.map((x) => (part: Uint8Array) => x().fromBytesRaw(part)) as any;

    return createScaleBuilder(
        name,
        (value) => encodeTuple(value, encoders),
        (bytes) => decodeTuple(bytes, decoders),
    );
}

type OptionInnerValue<T> = T extends Option<ScaleInstance<infer V>> ? V : never;
export function createOptionBuilder<T extends Option<ScaleInstance<any>>>(
    name: string,
    some: () => ScaleBuilder<OptionInnerValue<T>>,
): ScaleBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'None'],
        [1, 'Some', some],
    ]);
}

type ResultInnerOk<T extends Result<ScaleInstance<any>, ScaleInstance<any>>> = T extends Result<
    ScaleInstance<infer U>,
    ScaleInstance<any>
>
    ? U
    : never;
type ResultInnerErr<T extends Result<ScaleInstance<any>, ScaleInstance<any>>> = T extends Result<
    ScaleInstance<any>,
    ScaleInstance<infer U>
>
    ? U
    : never;
export function createResultBuilder<T extends Result<ScaleInstance<any>, ScaleInstance<any>>>(
    name: string,
    ok: BuilderFn<ResultInnerOk<T>>,
    err: BuilderFn<ResultInnerErr<T>>,
): ScaleBuilder<T> {
    return createEnumBuilder(name, [
        [0, 'Ok', ok],
        [1, 'Err', err],
    ]);
}
