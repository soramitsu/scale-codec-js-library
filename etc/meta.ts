import path from 'path'
import packageUtil from '../packages/util/package.json'
import packageCore from '../packages/core/package.json'
import packageEnum from '../packages/enum/package.json'
import packageCompiler from '../packages/definition-compiler/package.json'
import packageRuntime from '../packages/definition-runtime/package.json'
import { PackageJson } from 'type-fest'
import { match } from 'ts-pattern'

function getProdDeps({ dependencies }: PackageJson): string[] {
  return Object.keys(dependencies ?? {})
}

export const MONOREPO_ROOT = path.resolve(__dirname, '../')

function resolve(...paths: string[]): string {
  return path.resolve(MONOREPO_ROOT, ...paths)
}

export const PUBLIC_PACKAGES_UNSCOPED = ['enum', 'util', 'core', 'definition-compiler', 'definition-runtime'] as const

export const SCOPE = '@scale-codec'

export type ScaleCodecPackageUnscopedName = typeof PUBLIC_PACKAGES_UNSCOPED extends ReadonlyArray<infer T> ? T : never

export function scoped(name: ScaleCodecPackageUnscopedName): string {
  return `${SCOPE}/${name}`
}

export const PACKAGE_EXTERNALS: Record<ScaleCodecPackageUnscopedName, string[]> = {
  enum: getProdDeps(packageEnum),
  util: getProdDeps(packageUtil),
  core: getProdDeps(packageCore),
  'definition-compiler': getProdDeps(packageCompiler),
  'definition-runtime': getProdDeps(packageRuntime),
}

export function resolvePackageEntrypoint(
  name: ScaleCodecPackageUnscopedName,
  mode: 'ts' | 'js' | 'd.ts' | 'dir',
): string {
  return match(mode)
    .with('dir', () => resolve('packages', name))
    .with('ts', () => resolve(resolvePackageEntrypoint(name, 'dir'), 'src/lib.ts'))
    .with('js', 'd.ts', (mode) => resolve(TSC_BUILD_OUTPUT_DIR, name, `src/lib.${mode}`))
    .exhaustive()
}

export function resolvePackageDist(name: ScaleCodecPackageUnscopedName): string {
  return resolve('packages', name, 'dist')
}

export const COMPILER_SAMPLES_OUTPUT_DIR = resolve('packages/definition-compiler/tests/samples')

export const DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH = resolve(
  'packages/docs/src/snippets/namespace-schema-compiled.ts',
)

export const API_DOCUMENTATION_OUT = resolve('packages/docs/src/api')

export function resolveApiExtractorConfig(pkg: ScaleCodecPackageUnscopedName): string {
  return path.join(resolvePackageEntrypoint(pkg, 'dir'), 'api-extractor.json')
}

export const E2E_RUNTIME_ROLLUP_OUTPUT_DIR = resolve('e2e-spa/runtime-rollup')

export const TSC_BUILD_OUTPUT_DIR = resolve('tsc-build')

export const API_EXTRACTOR_TMP_DIR = resolve('etc/api/tmp')

export const E2E_ROOT = resolve('e2e-spa')

export const BUILD_ARTIFACTS_GLOBS = [
  '**/dist',
  'tsc-build',
  'packages/docs/src/api',
  'etc/api/tmp',
  'e2e-spa/runtime-rollup',
].map((x) => resolve(x))
