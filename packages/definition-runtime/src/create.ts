import {
  Decode,
  Encode,
  Enum,
  EnumDecoders,
  EnumDefToFactoryArgs,
  EnumEncoders,
  Option,
  Result,
  StructDecoders,
  StructEncoders,
  createArrayDecoder,
  createArrayEncoder,
  createEnumDecoder,
  createEnumEncoder,
  createMapDecoder,
  createMapEncoder,
  createSetDecoder,
  createSetEncoder,
  createStructDecoder,
  createStructEncoder,
  createTupleDecoder,
  createTupleEncoder,
  createUint8ArrayDecoder,
  createUint8ArrayEncoder,
  createVecDecoder,
  createVecEncoder,
} from '@scale-codec/core'
import { Opaque } from 'type-fest'
import { Codec, trackableCodec } from './core'
import { trackRefineDecodeLoc } from './tracking'

export type DefineOpaque<T, U extends Opaque<T, T>> = (actual: T) => U

const createYetAnotherOpaqueReturn =
  <T, U extends Opaque<T, T>>(): DefineOpaque<T, U> =>
  (actual) =>
    actual as U

type OpaqueRecursive<T> = Opaque<T, T>

const mergePropsWithFunction = <F extends (...args: any[]) => any, P>(fn: F, props: P): F & P =>
  Object.assign(fn, props) as any

// Arrays

export type ArrayCodecAndFactory<T extends Array<any>, U extends OpaqueRecursive<T>> = Codec<U> & DefineOpaque<T, U>

export function createArrayCodec<T extends Array<any>, U extends OpaqueRecursive<T>>(
  name: string,
  itemCodec: Codec<T extends Array<infer I> ? I : never>,
  len: number,
): ArrayCodecAndFactory<T, U> {
  const define = createYetAnotherOpaqueReturn<T, U>()

  const codec = trackableCodec(
    name,
    createArrayEncoder(itemCodec.encodeRaw, len),
    createArrayDecoder(itemCodec.decodeRaw, len),
  ) as Codec<U>

  return mergePropsWithFunction(define, codec)
}

export function createArrayU8Codec(name: string, len: number): Codec<Uint8Array> {
  return trackableCodec(name, createUint8ArrayEncoder(len), createUint8ArrayDecoder(len))
}

export function createVecCodec<T extends any[], U extends OpaqueRecursive<T>>(
  name: string,
  itemCodec: Codec<T extends (infer V)[] ? V : never>,
): ArrayCodecAndFactory<T, U> {
  const codec = trackableCodec(
    name,
    createVecEncoder(itemCodec.encodeRaw),
    createVecDecoder(itemCodec.decodeRaw),
  ) as Codec<U>

  const define = createYetAnotherOpaqueReturn<T, U>()

  return mergePropsWithFunction(define, codec)
}

export type TupleCodecs<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? [Codec<Head>, ...TupleCodecs<Tail>]
  : []

export function createTupleCodec<T extends Array<any>, U extends Opaque<T, T>>(
  name: string,
  codecs: TupleCodecs<T>,
): Codec<U> & DefineOpaque<T, U> {
  const encoders: Encode<any>[] = []
  const decoders: Decode<any>[] = []

  for (let i = 0, len = codecs.length, codec: Codec<any> = codecs[i]; i < len; i++, codec = codecs[i]) {
    encoders.push(codec.encodeRaw)
    decoders.push((walker) => trackRefineDecodeLoc(`<tuple>.${i}`, () => codec.decodeRaw(walker)))
  }

  const codec = trackableCodec(
    name,
    createTupleEncoder(encoders as any),
    createTupleDecoder(decoders as any),
  ) as Codec<U>

  const define = createYetAnotherOpaqueReturn<T, U>()

  return mergePropsWithFunction(define, codec)
}

// Enums

export type EnumFactory<T> = T extends Enum<infer Def> ? (...args: EnumDefToFactoryArgs<Def>) => T : never

const simpleEnumFactory: EnumFactory<any> = (...args: EnumDefToFactoryArgs<any>) => Enum.variant(...args)

export type EnumDefAsSchema<T> = T extends Enum<infer Def>
  ? (Def extends string
      ? [discriminant: number, tag: Def]
      : Def extends [infer Tag, infer Value]
      ? [discriminant: number, tag: Tag, codec: Codec<Value>]
      : never)[]
  : never

export type EnumCodecAndFactory<T> = Codec<T> & EnumFactory<T>

export function createEnumCodec<T extends Enum<any>, U extends Opaque<T, T>>(
  name: string,
  schema: EnumDefAsSchema<T>,
): EnumCodecAndFactory<U> {
  const encoders: EnumEncoders<any> = {} as any
  const decoders: EnumDecoders<any> = {}

  for (const [dis, tag, codec] of schema) {
    ;(encoders as any)[tag] = codec ? [dis, codec.encodeRaw] : dis
    ;(decoders as any)[dis] = codec
      ? [tag, ((walker) => trackRefineDecodeLoc(`<enum>::${tag}`, () => codec.decodeRaw(walker))) as Decode<any>]
      : tag
  }

  const codec = trackableCodec(name, createEnumEncoder(encoders as any), createEnumDecoder(decoders)) as Codec<U>

  return mergePropsWithFunction(simpleEnumFactory.bind({}), codec)
}

export function createOptionCodec<T extends Option<any>, U extends Opaque<T, T>>(
  name: string,
  someCodec: Codec<T extends Option<infer V> ? V : never>,
): EnumCodecAndFactory<U> {
  return createEnumCodec<T, U>(name, [
    [0, 'None'],
    [1, 'Some', someCodec],
  ] as EnumDefAsSchema<T>)
}

export function createResultCodec<T extends Result<any, any>, U extends OpaqueRecursive<T>>(
  name: string,
  okCodec: Codec<T extends Result<infer Ok, any> ? Ok : never>,
  errCodec: Codec<T extends Result<any, infer Err> ? Err : never>,
): EnumCodecAndFactory<U> {
  return createEnumCodec<T, U>(name, [
    [0, 'Ok', okCodec],
    [1, 'Err', errCodec],
  ] as EnumDefAsSchema<T>)
}

// Struct

export type StructCodecsSchema<T> = {
  [K in keyof T]: [K, Codec<T[K]>]
}[keyof T][]

export type StructCodecAndFactory<T, U extends Opaque<T, T>> = Codec<U> & DefineOpaque<T, U>

export function createStructCodec<T, U extends Opaque<T, T>>(
  name: string,
  orderedCodecs: StructCodecsSchema<T>,
): StructCodecAndFactory<T, U> {
  const decoders: StructDecoders<any> = []
  const encoders: StructEncoders<any> = []

  for (const [field, codec] of orderedCodecs as [string, Codec<any>][]) {
    decoders.push([field, (walker) => trackRefineDecodeLoc(`<struct>.${field}`, () => codec.decodeRaw(walker)) as any])
    encoders.push([field, codec.encodeRaw])
  }

  const codec = trackableCodec(name, createStructEncoder(encoders), createStructDecoder(decoders)) as Codec<U>

  return mergePropsWithFunction(createYetAnotherOpaqueReturn<T, U>(), codec)
}

// Map & Set

export type MapCodecAndFactory<T extends Map<any, any>, U extends Opaque<T, T>> = Codec<U> & DefineOpaque<T, U>

export function createMapCodec<T extends Map<any, any>, U extends Opaque<T, T>>(
  name: string,
  keyCodec: Codec<T extends Map<infer K, any> ? K : never>,
  valueCodec: Codec<T extends Map<any, infer V> ? V : never>,
): MapCodecAndFactory<T, U> {
  const codec = trackableCodec(
    name,
    createMapEncoder(keyCodec.encodeRaw, valueCodec.encodeRaw),
    createMapDecoder(
      (walker) => trackRefineDecodeLoc('<map>.<key>', () => keyCodec.decodeRaw(walker)),
      (walker) => trackRefineDecodeLoc('<map>.<value>', () => valueCodec.decodeRaw(walker)),
    ),
  ) as Codec<U>

  return mergePropsWithFunction(createYetAnotherOpaqueReturn<T, U>(), codec)
}

export type SetCodecAndFactory<T extends Set<any>, U extends Opaque<T, T>> = Codec<U> & DefineOpaque<T, U>

export function createSetCodec<T extends Set<any>, U extends Opaque<T, T>>(
  name: string,
  itemCodec: Codec<T extends Set<infer V> ? V : never>,
): SetCodecAndFactory<T, U> {
  const codec = trackableCodec(
    name,
    createSetEncoder(itemCodec.encodeRaw),
    createSetDecoder(itemCodec.decodeRaw),
  ) as Codec<U>

  return mergePropsWithFunction(createYetAnotherOpaqueReturn<T, U>(), codec)
}
