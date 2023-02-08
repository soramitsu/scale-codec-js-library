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
  encodeFactory,
  variant,
} from '@scale-codec/core'
import { Codec, trackableCodec } from './core'
import { trackRefineDecodeLoc } from './tracking'

/**
 * `U` should be the opaque version of `T`
 */
export type DefineOpaque<T, U> = (actual: T) => U

const createYetAnotherOpaqueReturn =
  <T, U>(): DefineOpaque<T, U> =>
  (actual) =>
    actual as unknown as U

const mergePropsWithFunction = <F extends (...args: any[]) => any, P>(fn: F, props: P): F & P =>
  Object.assign(fn, props) as any

// Arrays

export type CodecArray<T extends any[]> = Codec<T> & DefineOpaque<T[number][], T>

export function createArrayCodec<T extends Array<any>>(
  name: string,
  itemCodec: Codec<T extends Array<infer I> ? I : never>,
  len: number,
): CodecArray<T> {
  const define = createYetAnotherOpaqueReturn<T[number][], T>()

  const codec = trackableCodec(
    name,
    createArrayEncoder(itemCodec.encodeRaw, len),
    createArrayDecoder(itemCodec.decodeRaw, len),
  ) as Codec<T>

  return mergePropsWithFunction(define, codec)
}

export function createArrayU8Codec(name: string, len: number): Codec<Uint8Array> {
  return trackableCodec(name, createUint8ArrayEncoder(len), createUint8ArrayDecoder(len))
}

export function createVecCodec<T extends any[]>(
  name: string,
  itemCodec: Codec<T extends (infer V)[] ? V : never>,
): CodecArray<T> {
  const codec = trackableCodec(
    name,
    createVecEncoder(itemCodec.encodeRaw),
    createVecDecoder(itemCodec.decodeRaw),
  ) as Codec<T>

  const define = createYetAnotherOpaqueReturn<T[number], T>()

  return mergePropsWithFunction(define, codec)
}

export type TupleCodecs<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? [Codec<Head>, ...TupleCodecs<Tail>]
  : []

export function createTupleCodec<T extends Array<any>, U>(
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

// export type VariantFactoryFn<V extends VariantAny> = (...args: VariantToFactoryArgs<V>) => V
//
// export type EnumCodecAndFactory<T extends VariantAny> = Codec<T> & VariantFactoryFn<T>
//
export type EnumCodecSchema = [discriminant: number, tag: string, codec?: Codec<any>][]
//
// export type GetterEnumCodecAndFactory<T extends () => VariantAny> = Codec<T> &
//   (T extends (() => infer V extends VariantAny) ? (...args: VariantToFactoryArgs<V>) => T : never)
//
// function variantAsGetter(...args: VariantToFactoryArgs<any>): () => VariantAny {
//   return () => variant(...args)
// }

export interface EnumBox<V extends VariantAny> {
  enum: V
}

export type EnumBoxToFactory<E extends EnumBox<any>> = E extends EnumBox<infer V extends VariantAny>
  ? (...args: VariantToFactoryArgs<V>) => E
  : never

export type CodecEnum<E extends EnumBox<any>> = Codec<E> & EnumBoxToFactory<E>

const enumBoxFactory = (...args: VariantToFactoryArgs<any>): EnumBox<any> => ({ enum: variant(...args) })

export function createEnumCodec<E extends EnumBox<any>>(name: string, schema: EnumCodecSchema): CodecEnum<E> {
  const encoders: EnumEncoders<any> = {} as any
  const decoders: EnumDecoders<any> = {}

  for (const [dis, tag, codec] of schema) {
    ;(encoders as any)[tag] = codec ? [dis, codec.encodeRaw] : dis
    ;(decoders as any)[dis] = codec
      ? [tag, ((walker) => trackRefineDecodeLoc(`<enum>::${tag}`, () => codec.decodeRaw(walker))) as Decode<any>]
      : tag
  }

  const codecBase = trackableCodec(name, createEnumEncoder(encoders as any), createEnumDecoder(decoders))

  const codec: Codec<E> = {
    encodeRaw: encodeFactory(
      (e, walker) => codecBase.encodeRaw(e.enum, walker),
      (e) => codecBase.encodeRaw.sizeHint(e.enum),
    ),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    decodeRaw: (walker) => ({ enum: codecBase.decodeRaw(walker) } as E),
    toBuffer: (e) => codecBase.toBuffer(e.enum),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    fromBuffer: (src) => ({ enum: codecBase.fromBuffer(src) } as E),
  }

  // const factory =

  // const codec = getterCodec(codecBase)
  return mergePropsWithFunction(enumBoxFactory.bind({}), codec)
}

export function createOptionCodec<T>(name: string, someCodec: Codec<T>): CodecEnum<EnumBox<RustOption<T>>> {
  return createEnumCodec(name, [
    [0, 'None'],
    [1, 'Some', someCodec],
  ])
}

export function createResultCodec<Ok, Err>(
  name: string,
  okCodec: Codec<Ok>,
  errCodec: Codec<Err>,
): CodecEnum<EnumBox<RustResult<Ok, Err>>> {
  return createEnumCodec(name, [
    [0, 'Ok', okCodec],
    [1, 'Err', errCodec],
  ])
}

// Struct

export type StructCodecsSchema<T> = {
  [K in keyof T]: [K, Codec<T[K]>]
}[keyof T][]

export type FilterStringKeys<T> = {
  [K in keyof T & string]: T[K]
}

export type CodecStruct<T> = Codec<T> & DefineOpaque<FilterStringKeys<T>, T>

export function createStructCodec<T>(
  name: string,
  orderedCodecs: StructCodecsSchema<FilterStringKeys<T>>,
): CodecStruct<T> {
  const decoders: StructDecoders<any> = []
  const encoders: StructEncoders<any> = []

  for (const [field, codec] of orderedCodecs as [string, Codec<any>][]) {
    decoders.push([field, (walker) => trackRefineDecodeLoc(`<struct>.${field}`, () => codec.decodeRaw(walker)) as any])
    encoders.push([field, codec.encodeRaw])
  }

  const codec = trackableCodec(name, createStructEncoder(encoders), createStructDecoder(decoders)) as Codec<T>

  return mergePropsWithFunction(createYetAnotherOpaqueReturn<FilterStringKeys<T>, T>(), codec)
}

// Map & Set

export type CodecMap<T extends Map<any, any>> = Codec<T> &
  DefineOpaque<T extends Map<infer K, infer V> ? Map<K, V> : never, T>

export function createMapCodec<T extends Map<any, any>>(
  name: string,
  keyCodec: Codec<T extends Map<infer K, any> ? K : never>,
  valueCodec: Codec<T extends Map<any, infer V> ? V : never>,
): CodecMap<T> {
  const codec = trackableCodec(
    name,
    createMapEncoder(keyCodec.encodeRaw, valueCodec.encodeRaw),
    createMapDecoder(
      (walker) => trackRefineDecodeLoc('<map>.<key>', () => keyCodec.decodeRaw(walker)),
      (walker) => trackRefineDecodeLoc('<map>.<value>', () => valueCodec.decodeRaw(walker)),
    ),
  ) as Codec<T>

  return mergePropsWithFunction(
    createYetAnotherOpaqueReturn<T extends Map<infer K, infer V> ? Map<K, V> : never, T>(),
    codec,
  )
}

export type CodecSet<T extends Set<any>> = Codec<T> & DefineOpaque<T extends Set<infer U> ? Set<U> : never, T>

export function createSetCodec<T extends Set<any>>(
  name: string,
  itemCodec: Codec<T extends Set<infer V> ? V : never>,
): CodecSet<T> {
  const codec = trackableCodec(
    name,
    createSetEncoder(itemCodec.encodeRaw),
    createSetDecoder(itemCodec.decodeRaw),
  ) as Codec<T>

  return mergePropsWithFunction(createYetAnotherOpaqueReturn<T extends Set<infer U> ? Set<U> : never, T>(), codec)
}
