export interface RenderNamespaceDefinitionParams {
  types?: TypesDefinition

  /**
   * @default true
   */
  std?: boolean

  imports?: NamespaceImports

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

export type NamespaceImports = Record<string, (string | FullyQualifiedImport)[]>

export interface FullyQualifiedImport {
  name: string
  importAs: string
}

/**
 * The main map with all the definitions
 *
 * @remarks
 * Name of type should be **a valid JavaScript identifier name**, because it will be compiled to an identifier.
 */
export type TypesDefinition = Record<string, TypeDef>

export type TypeRef = string | DefArray

export interface DefArray extends Tagged<'array'> {
  type: string
  len: number
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

export type TypeDef = TypeRef | DefStruct | DefStructTuple | DefEnum

export interface Tagged<T extends string> {
  t: T
}

export interface DefStruct extends Tagged<'struct'> {
  fields: DefStructField[]
}

export interface DefStructTuple extends Tagged<'struct-tuple'> {
  items: TypeRef[]
}

export interface DefEnum extends Tagged<'enum'> {
  variants: DefEnumVariant[]
}

export interface DefEnumVariant {
  name: string
  /**
   * Discriminant
   */
  dis: number
  value?: TypeRef | DefStruct | DefStructTuple
}
