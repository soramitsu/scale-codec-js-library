import { Compact, Opaque, createSetCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

interface MySet extends Opaque<Set<bigint | number>, MySet> {}

const Codec = createSetCodec<Set<bigint | number>, MySet>('Set', Compact)

export default defineCodec<Set<bigint | number>>({
  encode: (v) => Codec.toBuffer(v as MySet),
  decode: (b) => Codec.fromBuffer(b),
})
