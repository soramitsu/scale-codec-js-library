import * as Scale from 'scale-codec'
import { defineCodec } from '../codec'

const codec = Scale.sizedArray(Scale.u64, 32)

export default defineCodec<bigint[]>({
  encode: (v) => codec.encode(v as any),
  decode: (bytes) => codec.decode(bytes),
})
