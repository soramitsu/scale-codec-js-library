export { version as VERSION_CORE_CURRENT } from '@scale-codec/core/package.json'
export { version as VERSION_RUNTIME_CURRENT } from '@scale-codec/definition-runtime/package.json'
import { devDependencies as thispkgdeps } from '../package.json'

export const { '@polkadot/types': VERSION_POLKA, 'scale-codec': VERSION_PARITY } = thispkgdeps

export type Pkg = typeof PKG_CORE | typeof PKG_RUNTIME | typeof PKG_POLKA | typeof PKG_PARITY

export const PKG_CORE = '@scale-codec/core'
export const PKG_RUNTIME = '@scale-codec/definition-runtime'
export const PKG_POLKA = '@polkadot/types'
export const PKG_PARITY = 'parity-scale-codec'
