import {
  PKG_CORE,
  PKG_PARITY,
  PKG_POLKA,
  PKG_RUNTIME,
  Pkg,
  VERSION_CORE_CURRENT,
  VERSION_PARITY,
  VERSION_POLKA,
  VERSION_RUNTIME_CURRENT,
} from './const'
import { match } from 'ts-pattern'
import { add, complete, cycle, save, suite } from 'benny'

export function saveCustom(name: string) {
  return save({
    folder: 'results',
    file: name,
    format: 'json',
  })
}

type BennyAddReturn = ReturnType<typeof add>

// eslint-disable-next-line max-params
export async function encodeDecodeSuitePair(
  name: string,
  fileName: string,
  encodeCases: BennyAddReturn[],
  decodeCases: BennyAddReturn[],
) {
  await suite(`${name} (encode)`, ...encodeCases, cycle(), complete(), saveCustom(fileName + '.encode'))
  await suite(`${name} (decode)`, ...decodeCases, cycle(), complete(), saveCustom(fileName + '.decode'))
}

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
