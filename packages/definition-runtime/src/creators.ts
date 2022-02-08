import {
    createArrayEncoder,
    createArrayDecoder,
    Enum,
    Option,
    Result,
    EnumGenericDef,
    EnumDef,
    createUint8ArrayEncoder,
    createUint8ArrayDecoder,
    createVecEncoder,
    createVecDecoder,
    createTupleEncoder,
    Encode,
    Decode,
    createTupleDecoder,
    createMapEncoder,
    createMapDecoder,
    createSetEncoder,
    createSetDecoder,
    EnumDecoders,
    EnumEncoders,
    createEnumEncoder,
    createEnumDecoder,
    StructDecoders,
    StructEncoders,
    createStructEncoder,
    createStructDecoder,
} from '@scale-codec/core'
import { trackRefineDecodeLoc } from './tracking'
import { Codec, CodecImpl, CodecValueEncodable, CodecValueDecoded, CodecAny } from './core'

export function createArrayCodec<T extends CodecAny>(name: string, itemCodec: T, len: number): VecCodec<T> {
    return new CodecImpl(name, createArrayEncoder(itemCodec.encode, len), createArrayDecoder(itemCodec.decode, len))
}

export function createUint8ArrayCodec(name: string, len: number): Codec<Uint8Array> {
    return new CodecImpl(name, createUint8ArrayEncoder(len), createUint8ArrayDecoder(len))
}

export type VecCodec<T extends CodecAny> = Codec<CodecValueEncodable<T>[], CodecValueDecoded<T>[]>

export function createVecCodec<T extends CodecAny>(name: string, itemCodec: T): VecCodec<T> {
    return new CodecImpl(name, createVecEncoder(itemCodec.encode), createVecDecoder(itemCodec.decode))
}

type TupleEncodable<T extends CodecAny[]> = T extends [infer Head, ...infer Tail]
    ? Head extends CodecAny
        ? Tail extends CodecAny[]
            ? [CodecValueEncodable<Head>, ...TupleEncodable<Tail>]
            : never
        : never
    : []

type TupleDecoded<T extends CodecAny[]> = T extends [infer Head, ...infer Tail]
    ? Head extends CodecAny
        ? Tail extends CodecAny[]
            ? [CodecValueDecoded<Head>, ...TupleDecoded<Tail>]
            : never
        : never
    : []

export type TupleCodec<T extends CodecAny[]> = Codec<TupleEncodable<T>, TupleDecoded<T>>

export function createTupleCodec<T extends CodecAny[]>(name: string, codecs: T): TupleCodec<T> {
    const encoders: Encode<any>[] = []
    const decoders: Decode<any>[] = []

    for (let i = 0, len = codecs.length, codec: Codec<any> = codecs[i]; i < len; i++, codec = codecs[i]) {
        encoders.push(codec.encode)
        decoders.push((walker) => trackRefineDecodeLoc(`<tuple>.${i}`, () => codec.decode(walker)))
    }

    return new CodecImpl(name, createTupleEncoder(encoders as any), createTupleDecoder(decoders as any))
}

export type MapCodec<K extends CodecAny, V extends CodecAny> = Codec<
    Map<CodecValueEncodable<K>, CodecValueEncodable<V>>,
    Map<CodecValueDecoded<K>, CodecValueDecoded<V>>
>

export function createMapCodec<K extends CodecAny, V extends CodecAny>(
    name: string,
    keyCodec: K,
    valueCodec: V,
): MapCodec<K, V> {
    return new CodecImpl(
        name,
        createMapEncoder(keyCodec.encode, valueCodec.encode),
        createMapDecoder(
            (walker) => trackRefineDecodeLoc('<map>.<key>', () => keyCodec.decode(walker)),
            (walker) => trackRefineDecodeLoc('<map>.<value>', () => valueCodec.decode(walker)),
        ),
    )
}

export type SetCodec<T extends CodecAny> = Codec<Set<CodecValueEncodable<T>>, Set<CodecValueDecoded<T>>>

export function createSetCodec<T extends CodecAny>(name: string, itemCodec: T): SetCodec<T> {
    return new CodecImpl(name, createSetEncoder(itemCodec.encode), createSetDecoder(itemCodec.decode))
}

export type EnumCodecs<Def extends EnumGenericDef> = (Def extends string
    ? [discriminant: number, tag: Def]
    : Def extends [infer T, infer V]
    ? [discriminant: number, tag: T, codec: Codec<V>]
    : never)[]

export type EnumCodecGenericDef = string | [string, CodecAny]

type EnumCodecGenericDefAsSchema<T extends EnumCodecGenericDef> = (T extends string
    ? [discriminant: number, tag: T]
    : T extends [infer T, infer V]
    ? [discriminant: number, tag: T, codec: V]
    : never)[]

export type EnumCodec<Def extends EnumCodecGenericDef> = Codec<
    Enum<Def extends [infer Tag, Codec<infer E, any>] ? [Tag, E] : Def>,
    Enum<Def extends [infer Tag, Codec<any, infer D>] ? [Tag, D] : Def>
>

export function createEnumCodec<Def extends EnumCodecGenericDef>(
    name: string,
    codecs: EnumCodecGenericDefAsSchema<Def>,
): EnumCodec<Def> {
    const encoders: EnumEncoders<any> = {} as any
    const decoders: EnumDecoders<any> = {}

    for (const [dis, tag, codec] of codecs) {
        ;(encoders as any)[tag] = codec ? [dis, codec.encode] : dis
        ;(decoders as any)[dis] = codec
            ? [tag, ((walker) => trackRefineDecodeLoc(`<enum>::${tag}`, () => codec.decode(walker))) as Decode<any>]
            : tag
    }

    return new CodecImpl(name, createEnumEncoder(encoders as any), createEnumDecoder(decoders))
}

export type OptionCodec<Some extends CodecAny> = Codec<
    Option<CodecValueEncodable<Some>>,
    Option<CodecValueDecoded<Some>>
>

export function createOptionCodec<Some extends CodecAny>(name: string, someCodec: Some): OptionCodec<Some> {
    return createEnumCodec<'None' | ['Some', Some]>(name, [
        [0, 'None'],
        [1, 'Some', someCodec],
    ]) as OptionCodec<Some>
}

export type ResultCodec<Ok extends CodecAny, Err extends CodecAny> = Codec<
    Result<CodecValueEncodable<Ok>, CodecValueEncodable<Err>>,
    Result<CodecValueDecoded<Ok>, CodecValueDecoded<Err>>
>

export function createResultCodec<Ok extends CodecAny, Err extends CodecAny>(
    name: string,
    okCodec: Ok,
    errCodec: Err,
): ResultCodec<Ok, Err> {
    return createEnumCodec<['Ok', Ok] | ['Err', Err]>(name, [
        [0, 'Ok', okCodec],
        [1, 'Err', errCodec],
    ]) as ResultCodec<Ok, Err>
}

export type StructCodec<T> = Codec<
    {
        [K in keyof T]: T[K] extends Codec<infer E, any> ? E : never
    },
    {
        [K in keyof T]: T[K] extends Codec<any, infer D> ? D : never
    }
>

type StructCodecAsSchema<T> = {
    [K in keyof T]: [K, T[K] extends CodecAny ? T[K] : never]
}[keyof T][]

export function createStructCodec<T extends { [K in string]: CodecAny }>(
    name: string,
    orderedCodecs: StructCodecAsSchema<T>,
): StructCodec<T> {
    const decoders: StructDecoders<any> = []
    const encoders: StructEncoders<any> = []

    for (const [field, codec] of orderedCodecs as [string, Codec<any>][]) {
        decoders.push([field, (walker) => trackRefineDecodeLoc(`<struct>.${field}`, () => codec.decode(walker)) as any])
        encoders.push([field, codec.encode])
    }

    return new CodecImpl(name, createStructEncoder(encoders), createStructDecoder(decoders))
}
