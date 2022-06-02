import { Enum, Option, EnumGenericDef, TagsEmpty, TagsValuable, TagValue, EnumDef, Result } from '@scale-codec/enum'
import { Decode, Walker, Encode } from '../types'
import { encodeFactory } from '../util'

type EncodeTuple<V> = [discriminant: number, encode: Encode<V>]

type DecodeTuple<T extends string, V> = [tag: T, decode: Decode<V>]

export type EnumEncoders<Def extends EnumGenericDef> = {
  [T in TagsEmpty<Def>]: number
} & {
  [T in TagsValuable<Def>]: EncodeTuple<TagValue<Def, T>>
}

export type EnumDecoders<Def extends EnumGenericDef> = {
  [D in number]: TagsEmpty<Def> | (Def extends [infer T & string, infer V] ? DecodeTuple<T & string, V> : never)
}

const getEncodeData = (
  encoders: Record<string, number | EncodeTuple<any>>,
  key: string,
): null | [discriminant: number, encode?: Encode<any>] => {
  const item = encoders[key]
  if (typeof item === 'number') return [item]
  if (!item) return null
  return item
}

function normalizeDecodeTuple(tuple: string | DecodeTuple<string, any>): [tag: string, decode?: Decode<any>] {
  return typeof tuple === 'string' ? [tuple] : tuple
}

const formatEncodersSchema = (encoders: EnumEncoders<any>): string => {
  return Object.entries(encoders)
    .map(([tag, encodeData]) => {
      const [discriminant, isValuable] =
        typeof encodeData === 'number' ? [encodeData, false] : [(encodeData as any)[0], true]
      const maybeTagSuffix = isValuable ? '(...)' : ''
      return `${tag}${maybeTagSuffix} => ${discriminant}`
    })
    .join(', ')
}

export class EnumEncodeError extends Error {
  public constructor(message: string, encoders: EnumEncoders<any>) {
    super(message + `; encoders schema: ${formatEncodersSchema(encoders)}`)
  }
}

export function encodeEnum<E extends Enum<any>>(value: E, encoders: EnumEncoders<EnumDef<E>>, walker: Walker): void {
  // here we can skip encoders and emptyness validation because it is already done
  // during the size hint computation step

  const [dis, encode] = getEncodeData(encoders, value.tag)!
  walker.u8[walker.idx++] = dis
  if (encode) {
    encode(value.value, walker)
  }
}

export function encodeEnumSizeHint<E extends Enum<any>>(
  value: E,
  encoders: EnumEncoders<E extends Enum<infer D> ? D : never>,
): number {
  const { tag, isEmpty } = value

  const encodeData = getEncodeData(encoders, tag)
  if (encodeData === null)
    throw new EnumEncodeError(`Invalid encode schema for Enum with tag "${tag}": ${(encoders as any)[tag]}`, encoders)

  const [, encode] = encodeData

  if (encode) {
    // valuable
    if (isEmpty) throw new EnumEncodeError(`Enum with tag "${tag}" is empty, but supposed not to be`, encoders)
    return 1 + encode.sizeHint(value.value)
  }

  // empty
  if (!isEmpty) throw new EnumEncodeError(`Enum with tag "${tag}" is not empty, but supposed to be`, encoders)
  return 1
}

export function createEnumEncoder<E extends Enum<any>>(encoders: EnumEncoders<EnumDef<E>>): Encode<E> {
  return encodeFactory(
    (val, walker) => encodeEnum(val, encoders, walker),
    (val) => encodeEnumSizeHint(val, encoders),
  )
}

function formatDecoders(decoders: EnumDecoders<any>): string {
  return Object.entries(decoders)
    .map(([discriminant, varAndDecoder]) => {
      const [tag, decode] = normalizeDecodeTuple(varAndDecoder)
      let right = tag
      if (decode) {
        right += '(...)'
      }
      return `${discriminant} => ${right}`
    })
    .join(', ')
}

export function decodeEnum<E extends Enum<any>>(walker: Walker, decoders: EnumDecoders<EnumDef<E>>): E {
  const discriminant = walker.u8[walker.idx++]

  const decoder = decoders[discriminant]
  if (!decoder)
    throw new Error(
      `Decode data for discriminant ${discriminant} is undefined; ` + `decoders schema: ${formatDecoders(decoders)}`,
    )

  const [tag, decode] = normalizeDecodeTuple(decoder)
  if (decode) return Enum.variant(tag, decode(walker)) as any
  return Enum.variant(tag) as any
}

export function createEnumDecoder<E extends Enum<any>>(decoders: EnumDecoders<EnumDef<E>>): Decode<E> {
  return (walker) => decodeEnum(walker, decoders)
}

type OptionSome<T extends Option<any>> = T extends Option<infer V> ? V : never

export function createOptionEncoder<T extends Option<any>>(encodeSome: Encode<OptionSome<T>>): Encode<T> {
  return createEnumEncoder<Enum<'None' | ['Some', OptionSome<T>]>>({
    None: 0,
    Some: [1, encodeSome],
  })
}

export function createOptionDecoder<T extends Option<any>>(decodeSome: Decode<OptionSome<T>>): Decode<T> {
  return createEnumDecoder<Enum<'None' | ['Some', OptionSome<T>]>>({
    0: 'None',
    1: ['Some', decodeSome],
  }) as Decode<T>
}

type ResultOk<T> = T extends Result<infer Ok, any> ? Ok : never
type ResultErr<T> = T extends Result<any, infer Err> ? Err : never

export function createResultEncoder<T extends Result<any, any>>(
  encodeOk: Encode<ResultOk<T>>,
  encodeErr: Encode<ResultErr<T>>,
): Encode<T> {
  return createEnumEncoder<Enum<['Ok', ResultOk<T>] | ['Err', ResultErr<T>]>>({
    Ok: [0, encodeOk],
    Err: [1, encodeErr],
  })
}

export function createResultDecoder<T extends Result<any, any>>(
  decodeOk: Decode<ResultOk<T>>,
  decodeErr: Decode<ResultErr<T>>,
): Decode<T> {
  return createEnumDecoder<Enum<['Ok', ResultOk<T>] | ['Err', ResultErr<T>]>>({
    0: ['Ok', decodeOk],
    1: ['Err', decodeErr],
  }) as Decode<T>
}

function optBoolByteToEnum(byte: number): Option<boolean> {
  switch (byte) {
    case 0:
      return Enum.variant('None')
    case 1:
      return Enum.variant('Some', true)
    case 2:
      return Enum.variant('Some', false)
    default:
      throw new Error(`Failed to decode OptionBool - byte is ${byte}`)
  }
}

/**
 * Special encoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const encodeOptionBool: Encode<Option<boolean>> = encodeFactory(
  (value, walker) => {
    walker.u8[walker.idx++] = value.is('None') ? 0 : value.as('Some') ? 1 : 2
  },
  () => 1,
)

/**
 * Special decoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const decodeOptionBool: Decode<Option<boolean>> = (walker) => optBoolByteToEnum(walker.u8[walker.idx++])
