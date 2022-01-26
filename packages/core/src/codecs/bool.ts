import { Encode, Decode } from '../types'
import { encodeFactory } from '../util'

export const encodeBool: Encode<boolean> = encodeFactory(
    (value, walker) => {
        walker.arr[walker.offset++] = value ? 1 : 0
    },
    () => 1,
)

export const decodeBool: Decode<boolean> = (walker) => walker.arr[walker.offset++] === 1
