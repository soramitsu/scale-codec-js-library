import { Codec, EnumBox, RustOption, createOptionCodec, dynCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../codec'

export type Chain = EnumBox<RustOption<Chain>>

const Chain: Codec<Chain> = createOptionCodec(
  'Chain',
  dynCodec(() => Chain),
)

export default defineCodec<Chain>({
  encode: (x) => Chain.toBuffer(x),
  decode: (x) => Chain.fromBuffer(x),
})
