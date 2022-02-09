import { encodeArray, decodeArray, encodeBigInt, decodeBigInt } from 'scale-codec-core-v-4'

const encodeU64 = (x: bigint) => encodeBigInt(x, 'u64')
export const encode = (arr: bigint[]) => encodeArray(arr, encodeU64, 32)

const decodeU64 = (input: Uint8Array) => decodeBigInt(input, 'u64')
export const decode = (input: Uint8Array): bigint[] => decodeArray(input, decodeU64, 32)[0]
