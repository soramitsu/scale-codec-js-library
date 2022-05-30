export * from './bool'
export * from './string'
export * from './int'
export * from './enum'
export * from './struct'
export * from './tuple'
export { defVec } from './vec'
export * from './map'
export * from './array'
export * from './set'

import JSBI from 'jsbi'
import { Codec, decodeCompact, encodeCompact } from '@scale-codec/core'
import { bool } from './bool'
import { i128, i16, i32, i64, i8, u128, u16, u32, u64, u8 } from './int'
import { str } from './string'
import { BYTES_VECTOR_CODEC } from './vec'

export type StdTypes = {
  str: string
  bool: boolean
  u8: number
  u16: number
  u32: number
  u64: JSBI
  u128: JSBI
  i8: number
  i16: number
  i32: number
  i64: JSBI
  i128: JSBI
  compact: JSBI
  'Vec<u8>': Uint8Array
  '()': null
}

type AsCodecs<T> = {
  [K in keyof T]: Codec<T[K]>
}

export const StdCodecs: AsCodecs<StdTypes> = {
  str,
  bool,
  u8,
  u16,
  u32,
  u64,
  i8,
  i16,
  i32,
  i64,
  u128,
  i128,
  compact: {
    encode: encodeCompact,
    decode: decodeCompact,
  },
  'Vec<u8>': BYTES_VECTOR_CODEC,
  // no zero-cost abstractions here т_т
  '()': {
    encode: () => new Uint8Array([]),
    decode: () => [null, 0],
  },
}
