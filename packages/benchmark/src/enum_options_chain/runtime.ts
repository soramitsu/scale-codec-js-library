import { createOptionCodec, Codec, dynCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'
import { Chain } from './core'

const ChainCodec: Codec<Chain> = createOptionCodec(
  'Chain',
  dynCodec(() => ChainCodec),
)

export default defineCodec<Chain>({
  encode: (x) => ChainCodec.toBuffer(x),
  decode: (x) => ChainCodec.fromBuffer(x),
})
