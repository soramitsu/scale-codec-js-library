import { Bool, createMapCodec, MapCodec, Str } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

const Codec: MapCodec<typeof Str, typeof Bool> = createMapCodec('Map', Str, Bool)

export default defineCodec<Map<string, boolean>>({
    encode: (v) => Codec.toBuffer(v),
    decode: (v) => Codec.fromBuffer(v),
})
