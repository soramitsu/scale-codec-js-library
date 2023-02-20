import { TypeDocOptions } from 'typedoc'
import { API_DOCUMENTATION_OUT, PUBLIC_PACKAGES_UNSCOPED, resolvePackageEntrypoint } from './meta'

const config = {
  entryPoints: PUBLIC_PACKAGES_UNSCOPED.map((pkg) => resolvePackageEntrypoint(pkg, 'dir')),
  out: API_DOCUMENTATION_OUT,
  plugin: ['typedoc-plugin-markdown'],
  githubPages: false,
  readme: 'none',
  // FIXME there is a known issue - re-exports are not referenced, but included into the project;
  //       `typedoc-plugin-resolve-crossmodule-references` doesn't help;
  //       Issue - https://github.com/TypeStrong/typedoc/issues/1835
  entryPointStrategy: 'packages',
  name: 'Scale JS',
  excludeInternal: true,
  cleanOutputDir: true,
  entryDocument: 'index.md',
} satisfies Partial<TypeDocOptions & { entryDocument: string }>

export default config
