import { Decode, Encode } from '../types'
import { encodeFactory } from '../util'

/**
 * Encoder to handle unit type (i.e. `()`)
 */
export const encodeUnit: Encode<null> = encodeFactory(
  () => {},
  () => 0,
)

/**
 * Decoder to handle unit type (i.e. `()`)
 */
export const decodeUnit: Decode<null> = () => null
