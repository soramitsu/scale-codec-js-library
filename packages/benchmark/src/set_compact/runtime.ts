import { Compact, createSetCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../codec'

type MySet = Set<bigint | number>

const Codec = createSetCodec<MySet>('Set', Compact)

export default defineCodec<MySet>({
  encode: (v) => Codec.toBuffer(v as MySet),
  decode: (b) => Codec.fromBuffer(b),
})
