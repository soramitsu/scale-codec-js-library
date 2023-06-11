import { match } from 'ts-pattern'
import { version as VERSION_CORE_CURRENT } from '../../core/package.json'
import { version as VERSION_RUNTIME_CURRENT } from '../../definition-runtime/package.json'
import { devDependencies as thispkgdeps } from '../package.json'

const { '@polkadot/types': VERSION_POLKA, 'scale-codec': VERSION_PARITY } = thispkgdeps

export type Pkg = typeof PKG_CORE | typeof PKG_RUNTIME | typeof PKG_POLKA | typeof PKG_PARITY

export const PKG_CORE = '@scale-codec/core'
export const PKG_RUNTIME = '@scale-codec/definition-runtime'
export const PKG_POLKA = '@polkadot/types'
export const PKG_PARITY = 'parity-scale-codec'

export function caseName(pkg: 'core' | 'runtime' | 'polka' | 'parity'): string {
  type Tuple = [Pkg, string]
  const [pkgFull, version]: Tuple = match(pkg)
    .with('core', (): Tuple => [PKG_CORE, VERSION_CORE_CURRENT])
    .with('runtime', (): Tuple => [PKG_RUNTIME, VERSION_RUNTIME_CURRENT])
    .with('polka', (): Tuple => [PKG_POLKA, VERSION_POLKA])
    .with('parity', (): Tuple => [PKG_PARITY, VERSION_PARITY])
    .exhaustive()

  return `[${pkgFull}][${version}]`
}

export function parseCaseName(value: string): { pkg: Pkg; version: string } {
  const match = value.match(/^\[(.+?)]\[(.+?)]$/)

  if (!match) throw new Error(`Unable to parse case name: ${value}`)

  const [, pkg, version] = match as [any, Pkg, string]
  return { pkg, version }
}
