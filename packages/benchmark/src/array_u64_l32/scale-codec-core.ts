import { WalkerImpl, createArrayEncoder, createArrayDecoder, encodeU64, decodeU64 } from '@scale-codec/core'

const encoder = createArrayEncoder(encodeU64, 32)
export const encode = (arr: bigint[]): Uint8Array => WalkerImpl.encode(arr, encoder)

const decoder = createArrayDecoder(decodeU64, 32)
export const decode = (input: Uint8Array): bigint[] => WalkerImpl.decode(input, decoder)
