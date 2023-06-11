import * as Scale from 'scale-codec'

const codec = Scale.sizedArray(Scale.u64, 32) as Scale.Codec<bigint[]>

export default codec
