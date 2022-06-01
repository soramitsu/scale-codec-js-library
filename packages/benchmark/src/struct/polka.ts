import { Struct, TypeRegistry } from '@polkadot/types'
import { defineCodec } from '../types'
import { factory } from './util'

export const reg = new TypeRegistry()
reg.register({
  Sample: Object.fromEntries(Object.keys(factory()).map((key) => [key, 'bool'])),
})
const SampleType = reg.createClass('Sample')

export default defineCodec<Struct>({
  encode: (x) => new SampleType(reg, x).toU8a(),
  decode: (x) => new SampleType(reg, x) as any,
})
