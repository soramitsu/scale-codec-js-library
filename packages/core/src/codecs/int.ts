import { assert } from '@scale-codec/util'
import { Decode, Encode, Walker } from '../types'
import { encodeFactory } from '../util'

/**
 * Set of integer types that are supported by codec for `number`
 */
export type IntTypes = `${'i' | 'u'}${8 | 16 | 32}`

/**
 * Set of integer types that are supported by codec for `bigint`
 */
export type BigIntTypes = IntTypes | `${'i' | 'u'}${64 | 128 | 256 | 512}`

type BigIntNativeSupported = `${'i' | 'u'}64`

const INT_BYTES_COUNT_MAP: { [K in IntTypes | BigIntTypes]: number } = {
  i8: 1,
  u8: 1,
  i16: 2,
  u16: 2,
  i32: 4,
  u32: 4,
  i64: 8,
  u64: 8,
  i128: 16,
  u128: 16,
  i256: 32,
  u256: 32,
  i512: 64,
  u512: 64,
}

const tySizeHint =
  (ty: IntTypes | BigIntTypes): (() => number) =>
  () =>
    INT_BYTES_COUNT_MAP[ty]

const isBigIntTyNativeSupported = (ty: BigIntTypes): ty is BigIntNativeSupported => INT_BYTES_COUNT_MAP[ty] === 8

const isIntTy = (ty: BigIntTypes): ty is IntTypes => INT_BYTES_COUNT_MAP[ty] <= 4

const isIntTypeSigned = (ty: IntTypes | BigIntTypes): boolean => ty[0] === 'i'

function checkNegative(value: number | bigint, ty: BigIntTypes): boolean {
  const isNegative = value < 0
  const isTySigned = isIntTypeSigned(ty)
  assert(!isNegative || isTySigned, () => `Negative num (${value}) is passed to unsigned ("${ty}") encoder`)

  return isNegative
}

/**
 * Encodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function encodeInt(value: number, ty: IntTypes, walker: Walker): void {
  checkNegative(value, ty)
  assert(Number.isSafeInteger(value), () => `Unsafe integer (${value}) is passed into encoder`)

  const { view, idx: offset } = walker

  switch (ty) {
    case 'i8':
      view.setInt8(offset, value)
      break
    case 'u8':
      view.setUint8(offset, value)
      break
    case 'i16':
      view.setInt16(offset, value, true)
      break
    case 'u16':
      view.setUint16(offset, value, true)
      break
    case 'i32':
      view.setInt32(offset, value, true)
      break
    case 'u32':
      view.setUint32(offset, value, true)
      break
  }

  walker.idx += INT_BYTES_COUNT_MAP[ty]
}

/**
 * Decodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function decodeInt(walker: Walker, ty: IntTypes): number {
  const { view, idx: offset } = walker
  let value: number

  switch (ty) {
    case 'i8':
      value = view.getInt8(offset)
      break
    case 'u8':
      value = view.getUint8(offset)
      break
    case 'i16':
      value = view.getInt16(offset, true)
      break
    case 'u16':
      value = view.getUint16(offset, true)
      break
    case 'i32':
      value = view.getInt32(offset, true)
      break
    case 'u32':
      value = view.getUint32(offset, true)
      break
  }

  walker.idx += INT_BYTES_COUNT_MAP[ty]

  return value
}

function encodeBINativeSupported(bi: bigint, ty: BigIntNativeSupported, walker: Walker): void {
  checkNegative(bi, ty)
  const { view, idx: offset } = walker
  switch (ty) {
    case 'u64':
      view.setBigUint64(offset, bi, true)
      break
    case 'i64':
      view.setBigInt64(offset, bi, true)
      break
  }
  walker.idx += INT_BYTES_COUNT_MAP[ty]
}

function decodeBINativeSupported(walker: Walker, ty: BigIntNativeSupported): bigint {
  const { view, idx: offset } = walker
  let value: bigint

  switch (ty) {
    case 'u64':
      value = view.getBigUint64(offset, true)
      break
    case 'i64':
      value = view.getBigInt64(offset, true)
      break
  }

  walker.idx += INT_BYTES_COUNT_MAP[ty]

  return value
}

// eslint-disable-next-line max-params
export function encodePositiveBigIntInto(
  positiveNum: bigint,
  mutSlice: Uint8Array,
  offset: number,
  bytesLimit: number,
): number {
  let i = 0
  while (positiveNum > 0 && i < bytesLimit) {
    // writing last byte into the slice
    mutSlice[offset + i++] = Number(positiveNum & 0xffn)
    // eslint-disable-next-line no-param-reassign
    positiveNum >>= 8n
  }
  if (positiveNum > 0) {
    throw new Error(`Number ${positiveNum} is out of bytes limit (${bytesLimit})`)
  }

  return i
}

export function countPositiveBigIntEffectiveBytes(positiveNum: bigint): number {
  let count = 0
  while (positiveNum > 0) {
    count++
    // eslint-disable-next-line no-param-reassign
    positiveNum >>= 8n
  }
  return count
}

/**
 * Encodes `bigint` in Little-Endian
 */
export function encodeBigInt(bi: bigint, ty: BigIntTypes, walker: Walker): void {
  // check for more optimal ways first
  if (isIntTy(ty)) {
    return encodeInt(Number(bi), ty, walker)
  }
  if (isBigIntTyNativeSupported(ty)) {
    return encodeBINativeSupported(bi, ty, walker)
  }

  // prepare
  const isNegative = checkNegative(bi, ty)
  const bytes = INT_BYTES_COUNT_MAP[ty]

  // transforming by twos-complement if needed
  // eslint-disable-next-line no-param-reassign
  isNegative && (bi = BigInt.asUintN(bytes * 8, bi))

  //
  encodePositiveBigIntInto(bi, walker.u8, walker.idx, bytes)

  // final chords
  walker.idx += bytes
}

/**
 * Decodes `bigint` in Little-Endian. It is like {@link decodeBigInt} but is not
 * binded to strict bytes count (1, 2, 4, 8, 16 etc)
 *
 * @remarks
 * Does not mutate walker's offset!
 */
export function decodeBigIntVarious(walker: Walker, bytes: number, signed: boolean): bigint {
  // negation analysis
  let isNegative =
    signed &&
    // extracting the most significant bit
    (walker.u8[walker.idx + bytes - 1] & 0b1000_0000) >> 7 === 1

  // iteration
  let value = 0n
  for (let i = 0, shift = 0n; i < bytes; i++, shift += 8n) {
    value += BigInt(walker.u8[walker.idx + i]) << shift
  }

  // apply negation
  isNegative && (value = BigInt.asIntN(bytes * 8, value))

  return value
}

/**
 * Decodes `bigint` in Little-Endian
 */
export function decodeBigInt(walker: Walker, ty: BigIntTypes): bigint {
  if (isIntTy(ty)) {
    return BigInt(decodeInt(walker, ty))
  }
  if (isBigIntTyNativeSupported(ty)) {
    return decodeBINativeSupported(walker, ty)
  }

  const isTySigned = isIntTypeSigned(ty)
  const bytes = INT_BYTES_COUNT_MAP[ty]
  const value = decodeBigIntVarious(walker, bytes, isTySigned)
  walker.idx += bytes
  return value
}

export function createIntEncoder(ty: IntTypes): Encode<number> {
  return encodeFactory((value, writer) => encodeInt(value, ty, writer), tySizeHint(ty))
}

export function createIntDecoder(ty: IntTypes): Decode<number> {
  return (reader) => decodeInt(reader, ty)
}

export function createBigIntEncoder(ty: BigIntTypes): Encode<bigint> {
  return encodeFactory((value, writer) => encodeBigInt(value, ty, writer), tySizeHint(ty))
}

export function createBigIntDecoder(ty: BigIntTypes): Decode<bigint> {
  return (reader) => decodeBigInt(reader, ty)
}

// pre-defined encoders/decoders

export const encodeU8 = createIntEncoder('u8')
export const decodeU8 = createIntDecoder('u8')
export const encodeI8 = createIntEncoder('i8')
export const decodeI8 = createIntDecoder('i8')

export const encodeU16 = createIntEncoder('u16')
export const decodeU16 = createIntDecoder('u16')
export const encodeI16 = createIntEncoder('i16')
export const decodeI16 = createIntDecoder('i16')

export const encodeU32 = createIntEncoder('u32')
export const decodeU32 = createIntDecoder('u32')
export const encodeI32 = createIntEncoder('i32')
export const decodeI32 = createIntDecoder('i32')

export const encodeU64 = createBigIntEncoder('u64')
export const decodeU64 = createBigIntDecoder('u64')
export const encodeI64 = createBigIntEncoder('i64')
export const decodeI64 = createBigIntDecoder('i64')

export const encodeU128 = createBigIntEncoder('u128')
export const decodeU128 = createBigIntDecoder('u128')
export const encodeI128 = createBigIntEncoder('i128')
export const decodeI128 = createBigIntDecoder('i128')
