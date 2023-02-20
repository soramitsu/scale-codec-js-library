import {
  PKG_CORE,
  PKG_POLKA,
  PKG_RUNTIME,
  Pkg,
  VERSION_CORE_CURRENT,
  VERSION_POLKA,
  VERSION_RUNTIME_CURRENT,
} from './const'

export type CaseType = 'encode' | 'decode'

export function caseName(type: CaseType, pkg: Pkg, version: string): string {
  return `[${type}][${pkg}][${version}]`
}

export function caseCoreCurrent(type: CaseType): string {
  return caseName(type, PKG_CORE, VERSION_CORE_CURRENT)
}

export function caseRuntimeCurrent(type: CaseType): string {
  return caseName(type, PKG_RUNTIME, VERSION_RUNTIME_CURRENT)
}

export function casePolka(type: CaseType): string {
  return caseName(type, PKG_POLKA, VERSION_POLKA)
}

export function parseCaseName(value: string): { type: CaseType; pkg: string; version: string } {
  const match = value.match(/^\[(.+?)\]\[(.+?)\]\[(.+?)\]$/)

  if (!match) throw new Error(`Unable to parse case name: ${value}`)

  const [, type, pkg, version] = match as [any, CaseType, string, string]
  return { type, pkg, version }
}
