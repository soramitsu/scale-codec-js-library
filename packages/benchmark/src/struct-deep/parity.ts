import * as Scale from 'scale-codec'
import { BuildStruct, DeepStructU32, DeepStructUnit, FIELDS } from './shared'

function recursiveCodec<T extends readonly string[], V>(
  fields: T,
  value: Scale.Codec<V>,
): Scale.Codec<BuildStruct<T, V>> {
  if (!fields.length) return value as any
  const [head, ...tail] = fields
  return Scale.object(Scale.field(head, recursiveCodec(tail, value))) as any
}

Scale.constant(null, new Uint8Array([]))

export const unit: Scale.Codec<DeepStructUnit> = recursiveCodec(FIELDS, Scale.constant(null, new Uint8Array([])))
export const u32: Scale.Codec<DeepStructU32> = recursiveCodec(FIELDS, Scale.u32)
