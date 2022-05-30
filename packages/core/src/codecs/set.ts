import { decodeCompact, encodeCompact } from './compact'
import { Decode, Walker, Encode } from '../types'
import { encodeFactory } from '../util'

export function encodeSet<T>(set: Set<T>, encodeItem: Encode<T>, walker: Walker): void {
  encodeCompact(set.size, walker)
  for (const item of set) {
    encodeItem(item, walker)
  }
}

export function encodeSetSizeHint<T>(set: Set<T>, encodeItem: Encode<T>): number {
  let size = encodeCompact.sizeHint(set.size)
  for (const item of set) {
    size += encodeItem.sizeHint(item)
  }
  return size
}

export function decodeSet<T>(walker: Walker, decodeItem: Decode<T>): Set<T> {
  let setSize = Number(decodeCompact(walker))
  const set = new Set<T>()
  while (--setSize >= 0) {
    set.add(decodeItem(walker))
  }
  return set
}

export function createSetEncoder<T>(encodeItem: Encode<T>): Encode<Set<T>> {
  return encodeFactory(
    (set, walker) => encodeSet(set, encodeItem, walker),
    (set) => encodeSetSizeHint(set, encodeItem),
  )
}

export function createSetDecoder<T>(decodeItem: Decode<T>): Decode<Set<T>> {
  return (walker) => decodeSet(walker, decodeItem)
}
