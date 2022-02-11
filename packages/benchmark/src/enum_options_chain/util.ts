import { Chain as ChainCore } from './core'
import { Enum as EnumCore } from '@scale-codec/core'
import { Chain as ChainCoreV04 } from './core-v04'
import { Enum as EnumV04 } from 'scale-codec-core-v-4'

export function factoryCore(depth: number): ChainCore {
    if (depth > 0) return EnumCore.variant('Some', factoryCore(depth - 1))
    return EnumCore.variant('None')
}

export function factoryCoreV04(depth: number): ChainCoreV04 {
    if (depth > 0) return EnumV04.valuable('Some', factoryCoreV04(depth - 1))
    return EnumV04.empty('None')
}
