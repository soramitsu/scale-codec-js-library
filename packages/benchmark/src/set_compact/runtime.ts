import { createSetCodec, Compact } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

const Codec = createSetCodec('Set', Compact)

export default defineCodec<Set<bigint | number>>({
    encode: (v) => Codec.toBuffer(v),
    decode: (b) => Codec.fromBuffer(b),
})
