import { Fragment, ScaleArrayBuilder, U64, createArrayBuilder } from 'scale-codec-definition-runtime-v-8'
import { defineCodec } from '../types'

const ArrU64L32: ScaleArrayBuilder<Fragment<bigint>[]> = createArrayBuilder('Arr', U64, 32)

export default defineCodec({
  encode: (arr: bigint[]) => ArrU64L32.wrap(arr).bytes,
  decode: (input: Uint8Array): bigint[] => ArrU64L32.fromBytes(input).unwrap(),
})
