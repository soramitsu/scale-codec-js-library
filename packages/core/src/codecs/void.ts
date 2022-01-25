import { Decode, Encode } from '../types'

/**
 * Encoder to handle void types like `()` from Rust
 */
export const encodeVoid: Encode<null> = function* () {}

/**
 * Decoder to handle void types like `()` from Rust
 */
export const decodeVoid: Decode<null> = () => [null, 0]
