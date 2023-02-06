import { EnumOf, EnumRecord, RustOption, RustResult, VariantAny, variant } from '@scale-codec/enum'
import { Decode, Encode, Walker } from '../types'
import { encodeFactory } from '../util'

type EncodeTuple<V> = [discriminant: number, encode: Encode<V>]

type DecodeTuple<T extends string, V> = [tag: T, decode: Decode<V>]

export type EnumEncoders<E extends EnumRecord> = {
  [tag in keyof E]: E[tag] extends [infer C] ? EncodeTuple<C> : number
}

export type EnumDecoders<E extends EnumRecord> = {
  [D in number]: { [tag in keyof E]: E[tag] extends [infer C] ? DecodeTuple<tag & string, C> : tag & string }[keyof E]
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
    .map(([tag, encodeData]: [string, number | EncodeTuple<any>]) => {
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

export function encodeEnum<V extends VariantAny>(value: V, encoders: EnumEncoders<EnumOf<V>>, walker: Walker): void {
  // here we can skip encoders and emptyness validation because it is already done
  // during the size hint computation step

  const [dis, encode] = getEncodeData(encoders, value.tag)!
  walker.u8[walker.idx++] = dis
  if (encode) {
    encode(value.content, walker)
  }
}

export function encodeEnumSizeHint<V extends VariantAny>(value: V, encoders: EnumEncoders<EnumOf<V>>): number {
  const { tag, unit } = value

  const encodeData = getEncodeData(encoders, tag)
  if (encodeData === null)
    throw new EnumEncodeError(`Invalid encode schema for Enum with tag "${tag}": ${(encoders as any)[tag]}`, encoders)

  const [, encode] = encodeData

  if (encode) {
    if (unit) throw new EnumEncodeError(`Enum with tag "${tag}" is empty, but supposed not to be`, encoders)
    return 1 + encode.sizeHint(value.content)
  }

  if (!unit) throw new EnumEncodeError(`Enum with tag "${tag}" is not empty, but supposed to be`, encoders)
  return 1
}

export function createEnumEncoder<V extends VariantAny>(encoders: EnumEncoders<EnumOf<V>>): Encode<V> {
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

export function decodeEnum<V extends VariantAny>(walker: Walker, decoders: EnumDecoders<EnumOf<V>>): V {
  const discriminant = walker.u8[walker.idx++]

  const decoder = decoders[discriminant]
  if (!decoder)
    throw new Error(
      `Decode data for discriminant ${discriminant} is undefined; decoders schema: ${formatDecoders(decoders)}`,
    )

  const [tag, decode] = normalizeDecodeTuple(decoder)
  if (decode) return variant<any>(tag, decode(walker)) as any
  return variant(tag) as any
}

export function createEnumDecoder<V extends VariantAny>(decoders: EnumDecoders<EnumOf<V>>): Decode<V> {
  return (walker) => decodeEnum(walker, decoders)
}

type OptionSome<T> = T extends RustOption<infer V> ? V : never

export function createOptionEncoder<T extends RustOption<any>>(encodeSome: Encode<OptionSome<T>>): Encode<T> {
  return createEnumEncoder({
    None: 0,
    Some: [1, encodeSome] as any,
  } as any)
}

export function createOptionDecoder<T extends RustOption<any>>(decodeSome: Decode<OptionSome<T>>): Decode<T> {
  return createEnumDecoder({
    0: 'None',
    1: ['Some', decodeSome],
  } as any)
}

type ResultOk<T> = T extends RustResult<infer Ok, any> ? Ok : never
type ResultErr<T> = T extends RustResult<any, infer Err> ? Err : never

export function createResultEncoder<T extends RustResult<any, any>>(
  encodeOk: Encode<ResultOk<T>>,
  encodeErr: Encode<ResultErr<T>>,
): Encode<T> {
  return createEnumEncoder({
    Ok: [0, encodeOk],
    Err: [1, encodeErr],
  } as any)
}

export function createResultDecoder<T extends RustResult<any, any>>(
  decodeOk: Decode<ResultOk<T>>,
  decodeErr: Decode<ResultErr<T>>,
): Decode<T> {
  return createEnumDecoder({
    0: ['Ok', decodeOk],
    1: ['Err', decodeErr],
  } as any)
}

function optBoolByteToEnum(byte: number): RustOption<boolean> {
  switch (byte) {
    case 0:
      return variant('None')
    case 1:
      return variant('Some', true)
    case 2:
      return variant('Some', false)
    default:
      throw new Error(`Failed to decode OptionBool - byte is ${byte}`)
  }
}

/**
 * Special encoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const encodeOptionBool: Encode<RustOption<boolean>> = encodeFactory(
  (value, walker) => {
    walker.u8[walker.idx++] = value.tag === 'None' ? 0 : value.content ? 1 : 2
  },
  () => 1,
)

/**
 * Special decoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const decodeOptionBool: Decode<RustOption<boolean>> = (walker) => optBoolByteToEnum(walker.u8[walker.idx++])
