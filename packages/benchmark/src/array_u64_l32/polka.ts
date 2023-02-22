import { TypeRegistry, U64, VecFixed } from '@polkadot/types'
import { defineCodec } from '../codec'

export const reg = new TypeRegistry()
export const Arr = reg.createClass('[u64; 32]')

export default defineCodec<VecFixed<U64>>({
  encode(arr) {
    return new Arr(reg, arr).toU8a()
  },
  decode(input: Uint8Array) {
    return new Arr(reg, input) as any
  },
})
