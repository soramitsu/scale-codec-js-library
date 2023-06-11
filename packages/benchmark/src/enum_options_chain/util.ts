import { variant as createCoreEnum } from '@scale-codec/core'
import { Chain as ChainCore } from './core'
import { Chain as PolkaChain, registry } from './polka'
import { Enum as EnumPolka } from '@polkadot/types-codec'
import { Chain as ChainParity } from './parity'

export function factoryCore(depth: number): ChainCore {
  return { enum: depth > 0 ? createCoreEnum('Some', factoryCore(depth - 1)) : createCoreEnum('None') }
}

export function factoryPolka(depth: number): EnumPolka {
  return new PolkaChain(registry, depth > 0 ? { Some: factoryPolka(depth - 1) } : { None: null }) as EnumPolka
}

export function factoryParity(depth: number): ChainParity {
  return depth > 0 ? { tag: 'Some', some: factoryParity(depth - 1) } : { tag: 'None' }
}
