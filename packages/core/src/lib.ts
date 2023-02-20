/**
 * Core SCALE library with tools to encode to and decode SCALE binaries. It includes implementations for
 * primitive types as well as for complex types.
 *
 * @packageDocumentation
 */

export * from './types'
export * from './codecs'
export * from './util'

// re-export enums
export {
  type Variant,
  type EnumRecord,
  variant,
  type Enumerate,
  type EnumOf,
  type VariantAny,
  type VariantToFactoryArgs,
  type VariantFactoryFn,
  type RustResult,
  type RustOption,
} from '@scale-codec/enum'
