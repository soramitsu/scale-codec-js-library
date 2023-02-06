import {
  Decode,
  Encode,
  RustOption,
  WalkerImpl,
  createOptionDecoder,
  createOptionEncoder,
  createStructDecoder,
  createStructEncoder,
  encodeFactory,
} from '@scale-codec/core'
import { defineCodec } from '../types'

export interface Chain {
  inner: RustOption<Chain>
}

const encoder: Encode<Chain> = createStructEncoder([
  [
    'inner',
    createOptionEncoder(
      encodeFactory(
        (v, w) => encoder(v, w),
        (v) => encoder.sizeHint(v),
      ),
    ),
  ],
])

const decoder: Decode<Chain> = createStructDecoder([['inner', createOptionDecoder((w) => decoder(w))]])

export default defineCodec({
  encode: (x) => WalkerImpl.encode(x, encoder),
  decode: (x) => WalkerImpl.decode(x, decoder),
})
