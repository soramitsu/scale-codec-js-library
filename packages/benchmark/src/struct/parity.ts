import * as Scale from 'scale-codec'
import { defineCodec } from '../types'
import { factory } from './util'

const codec = Scale.object(...Object.keys(factory()).map((key) => Scale.field(key, Scale.bool)))

export default defineCodec<Record<string, boolean>>({
  encode: (v) => codec.encode(v),
  decode: (arr) => codec.decode(arr),
})
