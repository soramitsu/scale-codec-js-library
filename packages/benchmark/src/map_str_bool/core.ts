import {
  WalkerImpl,
  createMapDecoder,
  createMapEncoder,
  decodeBool,
  decodeStr,
  encodeBool,
  encodeStr,
} from '@scale-codec/core'
import { defineCodec } from '../codec'

const encoder = createMapEncoder(encodeStr, encodeBool)
const decoder = createMapDecoder(decodeStr, decodeBool)

export default defineCodec<Map<string, boolean>>({
  encode: (v) => WalkerImpl.encode(v, encoder),
  decode: (v) => WalkerImpl.decode(v, decoder),
})
