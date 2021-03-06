import { Enum, Valuable } from '@scale-codec/enum'
import {
  ArrayDef,
  BytesArrayDef,
  EnumDef,
  MapDef,
  OptionDef,
  ResultDef,
  SetDef,
  StructDef,
  TupleDef,
  TypeDef,
  VecDef,
  WithTMark,
} from './types'

export type DefEnum = Enum<{
  Alias: Valuable<string>
  Array: Valuable<ArrayDef>
  ArrayBytes: Valuable<BytesArrayDef>
  Vec: Valuable<VecDef>
  Tuple: Valuable<TupleDef>
  Struct: Valuable<StructDef>
  Map: Valuable<MapDef>
  Set: Valuable<SetDef>
  Enum: Valuable<EnumDef>
  EnumOption: Valuable<OptionDef>
  EnumResult: Valuable<ResultDef>
}>

export function delMark<T extends WithTMark<{}, any>>(val: T): Omit<T, 't'> {
  const { t, ...rest } = val
  return rest
}

export function typeDefToEnum(def: TypeDef): DefEnum {
  if (typeof def === 'string') {
    return Enum.create('Alias', def)
  }
  if (def.t === 'array') {
    return Enum.create('Array', delMark(def))
  }
  if (def.t === 'bytes-array') {
    return Enum.create('ArrayBytes', delMark(def))
  }
  if (def.t === 'vec') {
    return Enum.create('Vec', delMark(def))
  }
  if (def.t === 'tuple') {
    return Enum.create('Tuple', delMark(def))
  }
  if (def.t === 'struct') {
    return Enum.create('Struct', delMark(def))
  }
  if (def.t === 'map') {
    return Enum.create('Map', delMark(def))
  }
  if (def.t === 'enum') {
    return Enum.create('Enum', delMark(def))
  }
  if (def.t === 'option') {
    return Enum.create('EnumOption', delMark(def))
  }
  if (def.t === 'set') {
    return Enum.create('Set', delMark(def))
  }
  return Enum.create('EnumResult', delMark(def))
}
