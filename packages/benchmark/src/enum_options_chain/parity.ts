import * as Scale from 'scale-codec'
import { defineCodec } from '../codec'

export type Chain = { tag: 'None' } | { tag: 'Some'; some: Chain }

const codec: Scale.Codec<Chain> = Scale.taggedUnion('tag', [
  Scale.variant('None'),
  Scale.variant(
    'Some',
    Scale.field(
      'some',
      Scale.deferred(() => codec),
    ),
  ),
])

export default defineCodec<Chain>({
  encode: (v) => codec.encode(v),
  decode: (arr) => codec.decode(arr),
})
