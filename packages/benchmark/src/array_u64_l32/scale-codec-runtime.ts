import { Opaque, U64, createArrayCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ArrU64L32 extends Opaque<bigint[], ArrU64L32> {}

const ArrU64L32 = createArrayCodec<bigint[], ArrU64L32>('Arr', U64, 32)

export default defineCodec({
  encode: (arr: bigint[]) => ArrU64L32.toBuffer(arr as ArrU64L32),
  decode: (input: Uint8Array) => ArrU64L32.fromBuffer(input),
})
