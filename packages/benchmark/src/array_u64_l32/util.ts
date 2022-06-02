import { U64, VecFixed } from '@polkadot/types-codec'
import { reg, Arr } from './polka'

export function factory(): bigint[] {
  return Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
}

export function nativeToPolka(data: bigint[]): VecFixed<U64> {
  return new Arr(reg, data)
}
