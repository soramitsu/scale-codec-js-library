import {
  Decode,
  Encode,
  Enum,
  WalkerImpl,
  createOptionDecoder,
  createOptionEncoder,
  encodeFactory,
} from '@scale-codec/core'
import { defineCodec } from '../types'

export type Chain = Enum<'None' | ['Some', Chain]>

const encoder: Encode<Chain> = createOptionEncoder<Chain>(
  encodeFactory(
    (v, w) => encoder(v, w),
    (v) => encoder.sizeHint(v),
  ),
)

const decoder: Decode<Chain> = createOptionDecoder<Chain>((w) => decoder(w))

export default defineCodec({
  encode: (x) => WalkerImpl.encode(x, encoder),
  decode: (x) => WalkerImpl.decode(x, decoder),
})
