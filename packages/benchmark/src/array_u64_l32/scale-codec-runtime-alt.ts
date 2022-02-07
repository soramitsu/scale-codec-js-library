import { Array_u64_l32 } from '@scale-codec/definition-runtime/src/alt/types'

export const encode = (arr: bigint[]): Uint8Array => Array_u64_l32.toBuffer(arr)
