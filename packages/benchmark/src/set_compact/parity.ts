import * as Scale from 'scale-codec'
import { defineCodec } from '../codec'

const codec = Scale.set(Scale.compact(Scale.u128))

export default defineCodec<Set<bigint>>({
  encode: (v) => codec.encode(v),
  decode: (a) => codec.decode(a),
})
