import * as Scale from 'scale-codec'

const codec = Scale.set(Scale.compact(Scale.u128))

export default codec
