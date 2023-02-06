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
  Variant,
  EnumRecord,
  variant,
  Enumerate,
  EnumOf,
  VariantAny,
  VariantToFactoryArgs,
  VariantFactoryFn,
  RustResult,
  RustOption,
} from '@scale-codec/enum'
