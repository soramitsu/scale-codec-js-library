/* eslint-disable @typescript-eslint/no-empty-interface */
import {
    createArrayEncoder,
    createArrayDecoder,
    Enum,
    Option,
    Result,
    EnumGenericDef,
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
    EnumDefToFactoryArgs,
} from '@scale-codec/core'
import { trackRefineDecodeLoc } from './tracking'
import { Codec, CodecImpl, CodecValueEncodable, CodecValueDecoded, CodecAny } from './core'
import { U32 } from '../dist-tsc/codecs'
import { Opaque } from 'type-fest'

export function createArrayCodec<T extends CodecAny>(name: string, itemCodec: T, len: number): VecCodec<T> {
    return new CodecImpl(
        name,
        createArrayEncoder(itemCodec.encodeRaw, len),
        createArrayDecoder(itemCodec.decodeRaw, len),
    )
}

export function createArrayU8Codec(name: string, len: number): Codec<Uint8Array> {
    return new CodecImpl(name, createUint8ArrayEncoder(len), createUint8ArrayDecoder(len))
}

export interface VecCodec<T extends CodecAny> extends Codec<CodecValueEncodable<T>[], CodecValueDecoded<T>[]> {}

export function createVecCodec<T extends CodecAny>(name: string, itemCodec: T): VecCodec<T> {
    return new CodecImpl(name, createVecEncoder(itemCodec.encodeRaw), createVecDecoder(itemCodec.decodeRaw))
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

export interface TupleCodec<T extends CodecAny[]> extends Codec<TupleEncodable<T>, TupleDecoded<T>> {}

export function createTupleCodec<T extends CodecAny[]>(name: string, codecs: T): TupleCodec<T> {
    const encoders: Encode<any>[] = []
    const decoders: Decode<any>[] = []

    for (let i = 0, len = codecs.length, codec: Codec<any> = codecs[i]; i < len; i++, codec = codecs[i]) {
        encoders.push(codec.encodeRaw)
        decoders.push((walker) => trackRefineDecodeLoc(`<tuple>.${i}`, () => codec.decodeRaw(walker)))
    }

    return new CodecImpl(name, createTupleEncoder(encoders as any), createTupleDecoder(decoders as any))
}

export interface MapCodec<K extends CodecAny, V extends CodecAny>
    extends Codec<
        Map<CodecValueEncodable<K>, CodecValueEncodable<V>>,
        Map<CodecValueDecoded<K>, CodecValueDecoded<V>>
    > {}

export function createMapCodec<K extends CodecAny, V extends CodecAny>(
    name: string,
    keyCodec: K,
    valueCodec: V,
): MapCodec<K, V> {
    return new CodecImpl(
        name,
        createMapEncoder(keyCodec.encodeRaw, valueCodec.encodeRaw),
        createMapDecoder(
            (walker) => trackRefineDecodeLoc('<map>.<key>', () => keyCodec.decodeRaw(walker)),
            (walker) => trackRefineDecodeLoc('<map>.<value>', () => valueCodec.decodeRaw(walker)),
        ),
    )
}

export interface SetCodec<T extends CodecAny> extends Codec<Set<CodecValueEncodable<T>>, Set<CodecValueDecoded<T>>> {}

export function createSetCodec<T extends CodecAny>(name: string, itemCodec: T): SetCodec<T> {
    return new CodecImpl(name, createSetEncoder(itemCodec.encodeRaw), createSetDecoder(itemCodec.decodeRaw))
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

export interface EnumCodec<Def extends EnumCodecGenericDef>
    extends Codec<
        Enum<Def extends [infer Tag, Codec<infer E, any>] ? [Tag, E] : Def>,
        Enum<Def extends [infer Tag, Codec<any, infer D>] ? [Tag, D] : Def>
    > {}

export function createEnumCodec<Def extends EnumCodecGenericDef>(
    name: string,
    codecs: EnumCodecGenericDefAsSchema<Def>,
): EnumCodec<Def> {
    const encoders: EnumEncoders<any> = {} as any
    const decoders: EnumDecoders<any> = {}

    for (const [dis, tag, codec] of codecs) {
        ;(encoders as any)[tag] = codec ? [dis, codec.encodeRaw] : dis
        ;(decoders as any)[dis] = codec
            ? [tag, ((walker) => trackRefineDecodeLoc(`<enum>::${tag}`, () => codec.decodeRaw(walker))) as Decode<any>]
            : tag
    }

    return new CodecImpl(name, createEnumEncoder(encoders as any), createEnumDecoder(decoders))
}

export interface OptionCodec<Some extends CodecAny>
    extends Codec<Option<CodecValueEncodable<Some>>, Option<CodecValueDecoded<Some>>> {}

export function createOptionCodec<Some extends CodecAny>(name: string, someCodec: Some): OptionCodec<Some> {
    return createEnumCodec<'None' | ['Some', Some]>(name, [
        [0, 'None'],
        [1, 'Some', someCodec],
    ]) as OptionCodec<Some>
}

export interface ResultCodec<Ok extends CodecAny, Err extends CodecAny>
    extends Codec<
        Result<CodecValueEncodable<Ok>, CodecValueEncodable<Err>>,
        Result<CodecValueDecoded<Ok>, CodecValueDecoded<Err>>
    > {}

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

export interface StructCodec<T>
    extends Codec<
        {
            [K in keyof T]: T[K] extends Codec<infer E, any> ? E : never
        },
        {
            [K in keyof T]: T[K] extends Codec<any, infer D> ? D : never
        }
    > {}

type StructCodecAsSchema<T> = {
    [K in keyof T]: [K, T[K] extends Codec<infer E, infer D> ? Codec<E, D> : never]
}[keyof T][]

export function createStructCodec<T extends { [K in string]: CodecAny }>(
    name: string,
    orderedCodecs: StructCodecAsSchema<T>,
): StructCodec<T> {
    const decoders: StructDecoders<any> = []
    const encoders: StructEncoders<any> = []

    for (const [field, codec] of orderedCodecs as [string, Codec<any>][]) {
        decoders.push([
            field,
            (walker) => trackRefineDecodeLoc(`<struct>.${field}`, () => codec.decodeRaw(walker)) as any,
        ])
        encoders.push([field, codec.encodeRaw])
    }

    return new CodecImpl(name, createStructEncoder(encoders), createStructDecoder(decoders))
}

// {
//     //     abstract class ScaleArray<T> extends Array<T> {}

//     //     interface Branded<T extends string> {
//     //         // __brand
//     //     }

//     //     interface ArrayCodec<Name extends string, T> extends Codec<Opaque<ScaleArray<T>, Name>> {
//     //         new (): Opaque<ScaleArray<T>, Name>
//     //     }

//     // eslint-disable-next-line no-inner-declarations
//     function createArrayCodec<T, Name extends string>(
//         name: Name,
//         itemCodec: Codec<T>,
//         len: number,
//     ): ArrayCodec<Name, T> {
//         // const ite

//         const codec = new CodecImpl(
//             name,
//             createArrayEncoder(itemCodec.encodeRaw, len),
//             createArrayDecoder(itemCodec.decodeRaw, len),
//         )

//         return null
//     }

//     // class ArrU32 extends createArrayCodec('ArrU32', U32, 5) {}

//     interface ScaleArray<T, Token> extends Opaque<T[], Token> {}

//     interface ScaleArrayConstructor<T, Token> extends Codec<ScaleArray<T, Token>> {
//         new (): ScaleArray<T, Token>
//     }

//     interface ScaleEnum<Def extends EnumGenericDef, Token> extends Opaque<Enum<Def>, Token> {}

//     interface ScaleEnumConstructor<Def extends EnumGenericDef, Token> extends Codec<ScaleEnum<Def, Token>> {
//         variant: (...args: EnumDefToFactoryArgs<Def>) => ScaleEnum<Def, Token>
//     }

//     // const u32_syn: Codec<number> = null

//     const Arr_u32_10_syn: ScaleArrayConstructor<number, 'test'> = null

//     const Opt_Arr_syn: ScaleEnumConstructor<'None' | ['Some', Arr_u32_10], 'Opt'> = null

//     const val1 = Arr_u32_10_syn.fromBuffer(new Uint8Array())
//     Arr_u32_10_syn.toBuffer(val1)
//     Arr_u32_10_syn.toBuffer([]) // should be err

//     const opt1 = Opt_Arr_syn.fromBuffer(new Uint8Array())
//     Opt_Arr_syn.variant('Some', []) // err
//     Opt_Arr_syn.variant('Some', [false]) // err
//     Opt_Arr_syn.variant('Some', val1) // err

//     class Arr_u32_10 extends ScaleArray<number, 'arr_u32_10_not_Syn'> {
//         public static fromBuffer(buff: ArrayBufferView): Arr_u32_10 {}

//         public static toBuffer(value: Arr_u32_10): Uint8Array {}

//         // public constructor() {
//         //     super()
//         //     // new Array()
//         // }

//         // private readonly []

//         // public co
//     }

//     const val = Arr_u32_10.fromBuffer(new Uint8Array())

//     Arr_u32_10.toBuffer([])
// }

// // eslint-disable-next-line no-lone-blocks
// {
//     /*
//         1. Each generated type should be opaque and could be created only explicitly - to provide the best
//             TypeScript security.
//         2. Each type could have it's own static helpers for construction, e.g. `.variant()` for enums
//         3. It is not important to have runtime types difference, i.e. via prototypes & instanceof
//         4. Each type should be declared as a single composed class, i.e. it should be possible
//            to reference it as a type like a class, and in the meanwhile it should be an actual runtime value, i.e. class,
//            that have static codec fields and it's instance is a final value
//      */
//     // interface
// }
