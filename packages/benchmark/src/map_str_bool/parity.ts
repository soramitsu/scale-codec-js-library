import * as Scale from 'scale-codec'
import { defineCodec } from '../codec'

export default defineCodec<Map<string, boolean>>(Scale.map(Scale.str, Scale.bool))
