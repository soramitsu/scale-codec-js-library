import {
  decodeBool,
  decodeCompact,
  decodeI128,
  decodeI16,
  decodeI32,
  decodeI64,
  decodeI8,
  decodeStr,
  decodeU128,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  decodeUint8Vec,
  decodeVoid,
  encodeBool,
  encodeCompact,
  encodeI128,
  encodeI16,
  encodeI32,
  encodeI64,
  encodeI8,
  encodeStr,
  encodeU128,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
  encodeUint8Vec,
  encodeVoid,
} from '@scale-codec/core'
import { trackableCodec } from './core'

// Integers

type U8 = number
const U8 = trackableCodec<I8>('u8', encodeU8, decodeU8)

type I8 = number
const I8 = trackableCodec<I8>('i8', encodeI8, decodeI8)

type U16 = number
const U16 = trackableCodec<U16>('u16', encodeU16, decodeU16)

type I16 = number
const I16 = trackableCodec<I16>('i16', encodeI16, decodeI16)

type U32 = number
const U32 = trackableCodec<U32>('u32', encodeU32, decodeU32)

type I32 = number
const I32 = trackableCodec<I32>('i32', encodeI32, decodeI32)

type U64 = bigint
const U64 = trackableCodec<U64>('u64', encodeU64, decodeU64)

type I64 = bigint
const I64 = trackableCodec<I64>('i64', encodeI64, decodeI64)

type U128 = bigint
const U128 = trackableCodec<U128>('u128', encodeU128, decodeU128)

type I128 = bigint
const I128 = trackableCodec<I128>('i128', encodeI128, decodeI128)

// Others

type Str = string
const Str = trackableCodec<Str>('str', encodeStr, decodeStr)

type Bool = boolean
const Bool = trackableCodec<Bool>('bool', encodeBool, decodeBool)

type Void = null
const Void = trackableCodec<Void>('void', encodeVoid, decodeVoid)

type VecU8 = Uint8Array
const VecU8 = trackableCodec<VecU8>('VecU8', encodeUint8Vec, decodeUint8Vec)

type Compact = bigint
const Compact = trackableCodec<Compact>('compact', encodeCompact, decodeCompact)

export { U8, I8, U16, I16, U32, I32, U64, I64, U128, I128, Str, Void, VecU8, Bool, Compact }
