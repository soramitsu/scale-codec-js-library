import { createArrayCodec, U64 } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

const ArrU64L32 = createArrayCodec('Arr', U64, 32)

export default defineCodec({
    encode: (arr: bigint[]) => ArrU64L32.toBuffer(arr),
    decode: (input: Uint8Array) => ArrU64L32.fromBuffer(input),
})
