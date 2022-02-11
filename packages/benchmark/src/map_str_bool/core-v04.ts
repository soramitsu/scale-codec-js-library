import { decodeBool, decodeMap, decodeStr, encodeBool, encodeMap, encodeStr } from 'scale-codec-core-v-4'
import { defineCodec } from '../types'

export default defineCodec<Map<string, boolean>>({
    encode: (v) => encodeMap(v, encodeStr, encodeBool),
    decode: (b) => decodeMap(b, decodeStr, decodeBool)[0],
})
