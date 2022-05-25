import {
  createMapDecoder,
  createMapEncoder,
  decodeBool,
  decodeStr,
  encodeBool,
  encodeStr,
  WalkerImpl,
} from '@scale-codec/core'
import { defineCodec } from '../types'

const encoder = createMapEncoder(encodeStr, encodeBool)
const decoder = createMapDecoder(decodeStr, decodeBool)

export default defineCodec<Map<string, boolean>>({
  encode: (v) => WalkerImpl.encode(v, encoder),
  decode: (v) => WalkerImpl.decode(v, decoder),
})
