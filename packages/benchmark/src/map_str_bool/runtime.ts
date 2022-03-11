import { Bool, createMapCodec, MapCodecAndFactory, Opaque, Str } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

type Actual = Map<Str, Bool>

interface MyMap extends Opaque<Actual, MyMap> {}

const Codec: MapCodecAndFactory<Actual, MyMap> = createMapCodec('Map', Str, Bool)

export default defineCodec<Actual>({
    encode: (v) => Codec.toBuffer(v as MyMap),
    decode: (v) => Codec.fromBuffer(v),
})
