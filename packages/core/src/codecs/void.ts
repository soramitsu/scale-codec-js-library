import { Decode, Encode } from '../types'
import { encodeFactory } from '../util'

/**
 * Encoder to handle void types like `()` from Rust
 */
export const encodeVoid: Encode<null> = encodeFactory(
  () => {},
  () => 0,
)

/**
 * Decoder to handle void types like `()` from Rust
 */
export const decodeVoid: Decode<null> = () => null
