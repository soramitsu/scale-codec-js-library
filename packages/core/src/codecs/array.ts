import { Decode, Walker, Encode } from '../types'
import { encodeFactory } from '../util'

// eslint-disable-next-line max-params
export function encodeArray<T>(arr: T[], encodeItem: Encode<T>, len: number, walker: Walker): void {
  // array length assertion may be omitted because it is already done during
  // the size hint computation step

  for (let i = 0; i < len; i++) {
    encodeItem(arr[i], walker)
  }
}

export function encodeArraySizeHint<T>(arr: T[], encodeItem: Encode<T>, len: number): number {
  if (arr.length !== len) throw new Error(`[T; ${arr.length}] is passed to [T; ${len}] encoder`)

  let sum = 0
  // eslint-disable-next-line no-param-reassign
  while (--len >= 0) {
    sum += encodeItem.sizeHint(arr[len])
  }
  return sum
}

export function createArrayEncoder<T>(encodeItem: Encode<T>, len: number): Encode<T[]> {
  return encodeFactory(
    (arr, walker) => encodeArray(arr, encodeItem, len, walker),
    (arr) => encodeArraySizeHint(arr, encodeItem, len),
  )
}

export function decodeArray<T>(walker: Walker, decodeItem: Decode<T>, len: number): T[] {
  const arr = new Array(len)
  for (let i = 0; i < len; i++) {
    arr[i] = decodeItem(walker)
  }
  return arr
}

export function createArrayDecoder<T>(decodeItem: Decode<T>, len: number): Decode<T[]> {
  return (walker) => decodeArray(walker, decodeItem, len)
}

/**
 * Encode to `[u8; x]` Rust's array directly from the native `Uint8Array`
 */
export function encodeUint8Array(value: Uint8Array, len: number, walker: Walker): void {
  // copy to prevent unexpected mutations
  walker.u8.set(value, walker.idx)
  walker.idx += value.byteLength
}

export function createUint8ArrayEncoder(len: number): Encode<Uint8Array> {
  return encodeFactory(
    (value, walker) => encodeUint8Array(value, len, walker),
    (value) => {
      if (value.length !== len) throw new Error(`[u8; ${value.length}] is passed to [u8; ${len}] encoder`)
      return len
    },
  )
}

/**
 * decode `[u8; x]` array directly into the native `Uint8Array`
 */
export function decodeUint8Array(walker: Walker, len: number): Uint8Array {
  const availableBytesCount = walker.u8.byteLength - walker.idx

  if (availableBytesCount < len)
    throw new Error(`[u8; ${availableBytesCount}] is passed to [u8; ${len}] decoder (len should be >= ${len})`)

  // slice to prevent unexpected source mutations
  const value = walker.u8.slice(walker.idx, walker.idx + len)
  walker.idx += len

  return value
}

export function createUint8ArrayDecoder(len: number): Decode<Uint8Array> {
  return (walker) => decodeUint8Array(walker, len)
}
