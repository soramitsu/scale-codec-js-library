import { Codec, RustOption, createOptionCodec, createStructCodec, dynCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

export type Chain = {
  inner: {
    enum: RustOption<Chain>
  }
}

const ChainCodec: Codec<Chain> = createStructCodec('Chain', [
  [
    'inner',
    createOptionCodec<Chain>(
      'OptionChain',
      dynCodec(() => ChainCodec),
    ),
  ],
])

export default defineCodec<Chain>({
  encode: (x) => ChainCodec.toBuffer(x),
  decode: (x) => ChainCodec.fromBuffer(x),
})
