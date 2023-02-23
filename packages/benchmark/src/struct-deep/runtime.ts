import { Codec, U32, Unit, createStructCodec } from '@scale-codec/definition-runtime'
import { BuildStruct, DeepStructU32, DeepStructUnit, FIELDS } from './shared'
import { defineRuntimeCodec } from '../codec'

function recursive<T extends readonly string[], V>(fields: T, value: Codec<V>): Codec<BuildStruct<T, V>> {
  if (!fields.length) return value as any
  const [head, ...tail] = fields
  return createStructCodec<any>('field_' + head, [[head, recursive(tail, value)]])
}

export const unit = defineRuntimeCodec(recursive(FIELDS, Unit) satisfies Codec<DeepStructUnit>)
export const u32 = defineRuntimeCodec(recursive(FIELDS, U32) satisfies Codec<DeepStructU32>)
