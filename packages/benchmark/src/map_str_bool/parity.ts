import * as Scale from 'scale-codec'
import { defineCodec } from '../types'

export default defineCodec<Map<string, boolean>>(Scale.map(Scale.str, Scale.bool))
