import { Encode, Decode } from '../types'
import { encodeFactory } from '../util'

export const encodeBool: Encode<boolean> = encodeFactory(
  (value, walker) => {
    walker.u8[walker.idx++] = value ? 1 : 0
  },
  () => 1,
)

export const decodeBool: Decode<boolean> = (walker) => walker.u8[walker.idx++] === 1
