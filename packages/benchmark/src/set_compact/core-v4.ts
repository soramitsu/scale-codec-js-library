import { decodeCompact, decodeSet, encodeCompact, encodeSet } from 'scale-codec-core-v-4'
import { defineCodec } from '../types'

export default defineCodec<Set<bigint | number>>({
  encode: (val) => encodeSet(val, encodeCompact),
  decode: (input) => decodeSet(input, decodeCompact)[0],
})
