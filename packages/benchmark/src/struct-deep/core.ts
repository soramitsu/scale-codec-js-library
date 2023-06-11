import {
  Decode,
  Encode,
  createStructDecoder,
  createStructEncoder,
  decodeU32,
  decodeUnit,
  encodeU32,
  encodeUnit,
} from '@scale-codec/core'
import { defineCoreCodec } from '../codec'
import { BuildStruct, FIELDS } from './shared'

function recursiveEncoder<T extends readonly string[], V>(fields: T, value: Encode<V>): Encode<BuildStruct<T, V>> {
  if (!fields.length) return value
  const [head, ...tail] = fields
  return createStructEncoder<any>([[head, recursiveEncoder(tail, value)]])
}

function recursiveDecoder<T extends readonly string[], V>(fields: T, value: Decode<V>): Decode<BuildStruct<T, V>> {
  if (!fields.length) return value as any
  const [head, ...tail] = fields
  return createStructDecoder<any>([[head, recursiveDecoder(tail, value)]])
}

export const unit = defineCoreCodec(recursiveEncoder(FIELDS, encodeUnit), recursiveDecoder(FIELDS, decodeUnit))
export const u32 = defineCoreCodec(recursiveEncoder(FIELDS, encodeU32), recursiveDecoder(FIELDS, decodeU32))
