export interface RenderNamespaceDefinitionParams {
  /**
   * Runtime library with STD codecs + reexports from the core library.
   *
   * Defaults to `@scale-codec/definition-runtime`
   */
  runtimeLib?: string

  /**
   * Types available in the runtime library.
   */
  runtimeTypes?: Set<string>

  /**
   * Single tuples are always an arrays with a single element. It is possible to make final code cleaner
   * (and a bit performant) if render such tuples just as aliases for the inner element. It is optional feature.
   */
  rollupSingleTuplesIntoAliases?: boolean

  /**
   * @default 'Void'
   */
  typeForVoidAliasing?: string

  /**
   * Enable sorting of types to minimize amount of allocated dynamic references between them
   *
   * @default false
   * @experimental
   */
  optimizeDyns?: boolean
}

/**
 * The main map with all the definitions
 *
 * @remarks
 * Name of type should be **a valid JavaScript identifier name**, because it will be compiled to an identifier.
 *
 * @example
 * ```ts
 * const definition: NamespaceDefinition = {
 *   Person: {
 *     t: 'struct',
 *     fields: [
 *       { name: 'name', ref: 'str' },
 *       { name: 'age', ref: 'u8' }
 *     ]
 *   },
 *   VecPerson: { t: 'vec', item: 'Person' }
 * }
 * ```
 */
export type NamespaceDefinition = Record<string, TypeDef>

export type TypeRef = string

/**
 * Just an alias to the inner type
 */
export type DefAlias = {
  ref: TypeRef
}

/**
 * Fixed-length array
 */
export type DefArray = {
  /**
   * Inner type name
   */
  item: TypeRef
  len: number
}

/**
 * It's like {@link DefArray} but for bytes (u8). Use it for bytes for better performance.
 */
export type DefBytesArray = {
  len: number
}

/**
 * `Vec<T>` definition
 */
export type DefVec = {
  /**
   * Inner vec type name
   */
  item: TypeRef
}

/**
 * Tuple definition
 */
export type DefTuple = {
  /**
   * Array of inner types
   */
  items: TypeRef[]
}

/**
 * Structure definition
 */
export type DefStruct = {
  /**
   * @remarks
   * **note**: order of fields matters!
   */
  fields: DefStructField[]
}

export type DefStructField = {
  /**
   * Name of the struct field
   */
  name: string
  /**
   * Reference to the type
   */
  ref: TypeRef
}

/**
 * Map definition (e.g. `HashMap`, `BTreeMap`)
 */
export type DefMap = {
  key: TypeRef
  value: TypeRef
}

/**
 * Set definition (e.g. `HashSet`, `BTreeSet`)
 */
export type DefSet = {
  entry: TypeRef
}

/**
 * Enum definition
 */
export type DefEnum = {
  /**
   * @remarks
   * Order of variants doesn't matter, but variants should not contain collisions between their names
   * and discriminants
   */
  variants: DefEnumVariant[]
}

export type DefEnumVariant = {
  name: string
  discriminant: number
  /**
   * No ref/null ref means that this variant is empty
   */
  ref?: TypeRef | null
}

/**
 * Option enum definition
 */
export type DefOption = {
  some: TypeRef
}

/**
 * Result enum definition
 */
export type DefResult = {
  ok: TypeRef
  err: TypeRef
}

/**
 * External type definition - import codec from external module
 *
 * @remarks
 * Provides a possibility to define external types, e.g. to use some complex structure from another compiled namespace
 * OR to define your own custom low-level codec for type that is not included into the SCALE codec spec by default.
 *
 * Note that the import should be of `FragmentBuilder` type.
 */
export type DefImport = {
  /**
   * Where to import from, path
   *
   * @example
   * ```ts
   * import { ... } from '<here is the module name>'
   * ```
   */
  module: string
  /**
   * Name of the type inside of the module. If this field is omitted, the own type name will be used
   *
   * @todo *define custom name for each import?*
   */
  nameInModule?: string
}

type WithTMark<T, M extends string> = T & {
  t: M
}

export type TypeDef =
  | WithTMark<DefAlias, 'alias'>
  | WithTMark<DefArray, 'array'>
  | WithTMark<DefBytesArray, 'bytes-array'>
  | WithTMark<DefVec, 'vec'>
  | WithTMark<DefTuple, 'tuple'>
  | WithTMark<DefStruct, 'struct'>
  | WithTMark<DefMap, 'map'>
  | WithTMark<DefSet, 'set'>
  | WithTMark<DefEnum, 'enum'>
  | WithTMark<DefOption, 'option'>
  | WithTMark<DefResult, 'result'>
  | WithTMark<DefImport, 'import'>
