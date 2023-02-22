import {
  Decode,
  Encode,
  WalkerImpl,
  createStructDecoder,
  createStructEncoder,
  decodeBool,
  encodeBool,
} from '@scale-codec/core'
import { defineCodec } from '../codec'
import { factory } from './util'

type Rec = Record<string, boolean>

const encoder: Encode<Rec> = createStructEncoder(Object.keys(factory()).map((key) => [key, encodeBool]))
const decoder: Decode<Rec> = createStructDecoder(Object.keys(factory()).map((key) => [key, decodeBool]))

export default defineCodec<Rec>({
  encode: (val) => WalkerImpl.encode(val, encoder),
  decode: (input) => WalkerImpl.decode(input, decoder),
})
