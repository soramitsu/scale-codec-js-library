import { U64, createArrayCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../codec'

type ArrU64L32 = bigint[]

const ArrU64L32 = createArrayCodec<ArrU64L32>('Arr', U64, 32)

export default defineCodec<ArrU64L32>({
  encode: (arr) => ArrU64L32.toBuffer(arr),
  decode: (input) => ArrU64L32.fromBuffer(input),
})
