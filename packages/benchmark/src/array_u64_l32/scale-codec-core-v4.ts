import { encodeArray, decodeArray, encodeBigInt, decodeBigInt } from 'scale-codec-core-v-4'
import { defineCodec } from '../types'

const encodeU64 = (x: bigint) => encodeBigInt(x, 'u64')

const decodeU64 = (input: Uint8Array) => decodeBigInt(input, 'u64')

export default defineCodec({
    encode: (arr: bigint[]) => encodeArray(arr, encodeU64, 32),
    decode: (input: Uint8Array): bigint[] => decodeArray(input, decodeU64, 32)[0],
})
