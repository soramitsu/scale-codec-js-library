import * as Scale from 'scale-codec'

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

export default codec
