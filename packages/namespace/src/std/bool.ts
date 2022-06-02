import { decodeBool, encodeBool, Codec } from '@scale-codec/core'

export const bool: Codec<boolean> = {
  encode: encodeBool,
  decode: decodeBool,
}
