import { WalkerImpl, createArrayDecoder, createArrayEncoder, decodeU64, encodeU64 } from '@scale-codec/core'
import { defineCodec } from '../codec'

const encoder = createArrayEncoder(encodeU64, 32)
const decoder = createArrayDecoder(decodeU64, 32)

export default defineCodec({
  encode: (arr) => WalkerImpl.encode(arr, encoder),
  decode: (input) => WalkerImpl.decode(input, decoder),
})
