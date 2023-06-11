import { WalkerImpl, createSetDecoder, createSetEncoder, decodeCompact, encodeCompact } from '@scale-codec/core'
import { defineCodec } from '../codec'

const encoder = createSetEncoder(encodeCompact)
const decoder = createSetDecoder(decodeCompact)

export default defineCodec<Set<bigint | number>>({
  encode: (val) => WalkerImpl.encode(val, encoder),
  decode: (input) => WalkerImpl.decode(input, decoder),
})
