import { createArrayBuilder, Fragment, ScaleArrayBuilder, U64 } from 'scale-codec-definition-runtime-v-8'

const ArrU64L32: ScaleArrayBuilder<Fragment<bigint>[]> = createArrayBuilder('Arr', U64, 32)

export const encode = (arr: bigint[]) => ArrU64L32.wrap(arr).bytes

export const decode = (input: Uint8Array): bigint[] => ArrU64L32.fromBytes(input).unwrap()
