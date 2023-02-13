import { Chain as ChainCore } from './core'
import { variant as createCoreEnum } from '@scale-codec/core'
import { Chain as ChainCoreV04 } from './core-v04'
import { Enum as EnumV04 } from 'scale-codec-core-v-4'
import { Chain as PolkaChain, OptionChain as PolkaOptionChain, registry } from './polka'
import { Enum as EnumPolka } from '@polkadot/types-codec'

export function factoryCore(depth: number): ChainCore {
  return { inner: depth > 0 ? createCoreEnum('Some', factoryCore(depth - 1)) : createCoreEnum('None') }
}

export function factoryCoreV04(depth: number): ChainCoreV04 {
  return {
    inner: depth > 0 ? EnumV04.valuable('Some', factoryCoreV04(depth - 1)) : EnumV04.empty('None'),
  }
}

export function factoryPolka(depth: number): EnumPolka {
  return new PolkaChain(registry, {
    inner: new PolkaOptionChain(registry, depth > 0 ? { Some: factoryPolka(depth - 1) } : { None: null }),
  }) as EnumPolka
}
