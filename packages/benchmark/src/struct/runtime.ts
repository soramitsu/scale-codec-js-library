import { Bool, createStructCodec } from '@scale-codec/definition-runtime'
import { defineCodec } from '../types'
import { factory } from './util'

const SampleCodec = createStructCodec(
  'Sample',
  Object.keys(factory()).map((key) => [key, Bool]),
)

export default defineCodec<any>({
  encode: (x) => SampleCodec.toBuffer(x),
  decode: (x) => SampleCodec.fromBuffer(x),
})
