export { version as VERSION_CORE_CURRENT } from '@scale-codec/core/package.json'
export { version as VERSION_RUNTIME_CURRENT } from '@scale-codec/definition-runtime/package.json'
import { dependencies as thispkgdeps } from '../package.json'

export const {
    'scale-codec-core-v-4': VERSION_CORE_PRE,
    'scale-codec-definition-runtime-v-8': VERSION_RUNTIME_PRE,
    '@polkadot/types': VERSION_POLKA,
} = thispkgdeps

export type Pkg = typeof PKG_CORE | typeof PKG_RUNTIME | typeof PKG_POLKA

export const PKG_CORE = '@scale-codec/core'
export const PKG_RUNTIME = '@scale-codec/definition-runtime'
export const PKG_POLKA = '@polkadot/types'
