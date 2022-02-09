import { createArrayCodec, U64 } from '@scale-codec/definition-runtime'

const ArrU64L32 = createArrayCodec('Arr', U64, 32)

export const encode = (arr: bigint[]) => ArrU64L32.toBuffer(arr)

export const decode = (input: Uint8Array) => ArrU64L32.fromBuffer(input)
