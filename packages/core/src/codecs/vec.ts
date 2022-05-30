import { Decode, Encode, Walker } from '../types'
import { decodeCompact, encodeCompact } from '../codecs/compact'
import { decodeArray } from './array'
import { encodeFactory } from '../util'

export function encodeVec<T>(vec: T[], encodeItem: Encode<T>, walker: Walker): void {
  encodeCompact(BigInt(vec.length), walker)
  for (const item of vec) {
    encodeItem(item, walker)
  }
}

export function encodeVecSizeHint<T>(vec: T[], encodeItem: Encode<T>): number {
  let size = encodeCompact.sizeHint(vec.length)
  for (let i = vec.length - 1; i >= 0; i--) {
    size += encodeItem.sizeHint(vec[i])
  }
  return size
}

export function createVecEncoder<T>(encodeItem: Encode<T>): Encode<T[]> {
  return encodeFactory(
    (vec, walker) => encodeVec(vec, encodeItem, walker),
    (vec) => encodeVecSizeHint(vec, encodeItem),
  )
}

export function decodeVec<T>(walker: Walker, decodeItem: Decode<T>): T[] {
  const vecLength = decodeCompact(walker)
  return decodeArray(walker, decodeItem, Number(vecLength))
}

export function createVecDecoder<T>(decodeItem: Decode<T>): Decode<T[]> {
  return (walker) => decodeVec(walker, decodeItem)
}

export const encodeUint8Vec: Encode<Uint8Array> = encodeFactory(
  (vec, walker) => {
    encodeCompact(vec.byteLength, walker)
    walker.u8.set(vec, walker.idx)
    walker.idx += vec.byteLength
  },
  (vec) => encodeCompact.sizeHint(vec.byteLength) + vec.byteLength,
)

export const decodeUint8Vec: Decode<Uint8Array> = (walker) => {
  const len = Number(decodeCompact(walker))
  const vec = walker.u8.slice(walker.idx, walker.idx + len)
  walker.idx += len
  return vec
}
