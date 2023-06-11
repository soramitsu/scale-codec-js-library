import * as Scale from 'scale-codec'
import { factory } from './util'

const codec = Scale.object(...Object.keys(factory()).map((key) => Scale.field(key, Scale.bool)))

export default codec
