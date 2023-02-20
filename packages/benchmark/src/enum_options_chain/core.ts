import {
  Decode,
  Encode,
  RustOption,
  WalkerImpl,
  createOptionDecoder,
  createOptionEncoder,
  encodeFactory,
} from '@scale-codec/core'
import { defineCodec } from '../types'

export interface Chain {
  enum: RustOption<Chain>
}

const encode: Encode<Chain> = encodeFactory(
  (x, walker) => encodeInner(x.enum, walker),
  (x) => encodeInner.sizeHint(x.enum),
)

const encodeInner: Encode<RustOption<Chain>> = createOptionEncoder(encode)

const decode: Decode<Chain> = (walker) => {
  const inner = decodeInner(walker)
  return { enum: inner }
}

const decodeInner: Decode<RustOption<Chain>> = createOptionDecoder(decode)

export default defineCodec({
  encode: (x) => WalkerImpl.encode(x, encode),
  decode: (x) => WalkerImpl.decode(x, decode),
})
