import { createArrayBuilder, Fragment, ScaleArrayBuilder, U64 } from '@scale-codec/definition-runtime'

const ArrU64L32: ScaleArrayBuilder<Fragment<bigint>[]> = createArrayBuilder('Arr', U64, 32)

export const encode = (arr: bigint[]) => ArrU64L32.wrap(arr).bytes
