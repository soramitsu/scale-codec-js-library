import { Codec, RustOption, createOptionCodec, createStructCodec, dynCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'
import { Chain } from './core'

const ChainCodec: Codec<Chain> = createStructCodec('Chain', [
  [
    'inner',
    createOptionCodec<RustOption<Chain>>(
      'OptionChain',
      dynCodec(() => ChainCodec),
    ),
  ],
])

export default defineCodec<Chain>({
  encode: (x) => ChainCodec.toBuffer(x),
  decode: (x) => ChainCodec.fromBuffer(x),
})
