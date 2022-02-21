import path from 'path'

function resolve(...paths: string[]): string {
    return path.resolve(__dirname, '../', ...paths)
}

export const PUBLIC_PACKAGES_UNSCOPED = ['enum', 'util', 'core', 'definition-compiler', 'definition-runtime'] as const

export const SCOPE = '@scale-codec'

export type ScaleCodecPackageUnscopedName = typeof PUBLIC_PACKAGES_UNSCOPED extends ReadonlyArray<infer T> ? T : never

export function scoped(name: ScaleCodecPackageUnscopedName): string {
    return `${SCOPE}/${name}`
}

export const PACKAGE_EXTERNALS: Record<ScaleCodecPackageUnscopedName, string[]> = {
    enum: [],
    util: [],
    core: [scoped('enum'), scoped('util')],
    'definition-compiler': ['sort-es', 'immutable', scoped('enum'), scoped('util')],
    'definition-runtime': [scoped('enum'), scoped('util'), scoped('core'), 'fmt-subs'],
}

export function resolvePackageEntrypoint(name: ScaleCodecPackageUnscopedName): string {
    return resolve('packages', name, 'src/lib.ts')
}

export function resolvePackageDist(name: ScaleCodecPackageUnscopedName): string {
    return resolve('packages', name, 'dist')
}

export const COMPILER_SAMPLES_OUTPUT_DIR = resolve('packages/definition-compiler/tests/samples')

export const DOCS_NAMESPACE_SCHEMA_COMPILED_SNIPPET_PATH = resolve(
    'packages/docs/src/snippets/namespace-schema-compiled.ts',
)

export const API_DOCUMENTER_OUTPUT = resolve('packages/docs/src/api')

export function resolveApiExtractorConfig(pkg: ScaleCodecPackageUnscopedName): string {
    return resolve('packages', pkg, 'api-extractor.json')
}

export const E2E_RUNTIME_ROLLUP_OUTPUT_DIR = resolve('e2e-spa/runtime-rollup')

export const TSC_BUILD_OUTPUT_DIR = resolve('dist-tsc')

export function resolveTSCPackageOutput(name: ScaleCodecPackageUnscopedName): string {
    return path.join(TSC_BUILD_OUTPUT_DIR, name, 'src')
}

/**
 * After running of `tsc` output is in the:
 *
 * `<root>/dist-tsc/<package>/src/...`
 *
 * To run API extractor, each package's output should be moved into it's own `dist-dir`:
 *
 * `<root>/packages/<package>/dist-dir/...`
 */
export function resolveTSCPackageOutputMove(name: ScaleCodecPackageUnscopedName): string {
    return resolve('packages', name, 'dist-tsc')
}

export const API_EXTRACTOR_TMP_DIR = resolve('api-extractor/temp')

export const E2E_ROOT = resolve('e2e-spa')

export const BUILD_ARTIFACTS_GLOBS = [
    'dist',
    'dist-tsc',
    'packages/*/dist',
    'packages/*/dist-tsc',
    'packages/docs/src/api',
    'api-extractor/temp',
    'e2e-spa/runtime-rollup',
].map((x) => resolve(x))
