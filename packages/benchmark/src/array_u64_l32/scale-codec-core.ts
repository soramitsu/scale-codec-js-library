import { WalkerImpl, createArrayEncoder, createArrayDecoder, encodeU64, decodeU64 } from '@scale-codec/core'
import { defineCodec } from '../types'

const encoder = createArrayEncoder(encodeU64, 32)
const decoder = createArrayDecoder(decodeU64, 32)

export default defineCodec({
  encode: (arr) => WalkerImpl.encode(arr, encoder),
  decode: (input) => WalkerImpl.decode(input, decoder),
})
