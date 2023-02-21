import { Bool, Str, createMapCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

type MyMap = Map<Str, Bool>

const Codec = createMapCodec<MyMap>('Map', Str, Bool)

export default defineCodec<MyMap>({
  encode: (v) => Codec.toBuffer(v as MyMap),
  decode: (v) => Codec.fromBuffer(v),
})
