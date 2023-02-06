import {
  Decode,
  Encode,
  EnumDecoders,
  EnumEncoders,
  RustOption,
  RustResult,
  StructDecoders,
  StructEncoders,
  VariantAny,
  VariantToFactoryArgs,
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
  variant,
} from '@scale-codec/core'
import { Codec, trackableCodec } from './core'
import { trackRefineDecodeLoc } from './tracking'

/**
 * `U` should be the opaque version of `T`
 */
export type DefineOpaque<T, U extends T> = (actual: T) => U

const createYetAnotherOpaqueReturn =
  <T, U extends T>(): DefineOpaque<T, U> =>
  (actual) =>
    actual as unknown as U

const mergePropsWithFunction = <F extends (...args: any[]) => any, P>(fn: F, props: P): F & P =>
  Object.assign(fn, props) as any

// Arrays

export type ArrayCodecAndFactory<T extends Array<any>, U extends T> = Codec<U> & DefineOpaque<T, U>

export function createArrayCodec<T extends Array<any>, U extends T>(
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

export function createVecCodec<T extends any[], U extends T>(
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

export function createTupleCodec<T extends Array<any>, U extends T>(
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

export type CreateOpaqueEnumFn<V extends VariantAny> = (...args: VariantToFactoryArgs<V>) => V

export type EnumCodecAndFactory<T extends VariantAny> = Codec<T> & CreateOpaqueEnumFn<T>

export function createEnumCodec<T extends VariantAny>(
  name: string,
  schema: [discriminant: number, tag: string, codec?: Codec<any>][],
): EnumCodecAndFactory<T> {
  const encoders: EnumEncoders<any> = {} as any
  const decoders: EnumDecoders<any> = {}

  for (const [dis, tag, codec] of schema) {
    ;(encoders as any)[tag] = codec ? [dis, codec.encodeRaw] : dis
    ;(decoders as any)[dis] = codec
      ? [tag, ((walker) => trackRefineDecodeLoc(`<enum>::${tag}`, () => codec.decodeRaw(walker))) as Decode<any>]
      : tag
  }

  const codec = trackableCodec(name, createEnumEncoder(encoders as any), createEnumDecoder(decoders)) as Codec<T>

  return mergePropsWithFunction(variant.bind({}), codec)
}

export function createOptionCodec<T extends RustOption<any>>(
  name: string,
  someCodec: Codec<T extends RustOption<infer V> ? V : never>,
): EnumCodecAndFactory<T> {
  return createEnumCodec<T>(name, [
    [0, 'None'],
    [1, 'Some', someCodec],
  ])
}

export function createResultCodec<T extends RustResult<any, any>>(
  name: string,
  okCodec: Codec<T extends RustResult<infer Ok, any> ? Ok : never>,
  errCodec: Codec<T extends RustResult<any, infer Err> ? Err : never>,
): EnumCodecAndFactory<T> {
  return createEnumCodec<T>(name, [
    [0, 'Ok', okCodec],
    [1, 'Err', errCodec],
  ])
}

// Struct

export type StructCodecsSchema<T> = {
  [K in keyof T]: [K, Codec<T[K]>]
}[keyof T][]

export type StructCodecAndFactory<T, U extends T> = Codec<U> & DefineOpaque<T, U>

export function createStructCodec<T, U extends T>(
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

export type MapCodecAndFactory<T extends Map<any, any>, U extends T> = Codec<U> & DefineOpaque<T, U>

export function createMapCodec<T extends Map<any, any>, U extends T>(
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

export type SetCodecAndFactory<T extends Set<any>, U extends T> = Codec<U> & DefineOpaque<T, U>

export function createSetCodec<T extends Set<any>, U extends T>(
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
