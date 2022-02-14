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
import { CodecImpl } from './core'

export const U128 = new CodecImpl('u128', encodeU128, decodeU128)
export const I128 = new CodecImpl('i128', encodeI128, decodeI128)

export const U64 = new CodecImpl('u64', encodeU64, decodeU64)
export const I64 = new CodecImpl('i64', encodeI64, decodeI64)

export const U32 = new CodecImpl('u32', encodeU32, decodeU32)
export const I32 = new CodecImpl('i32', encodeI32, decodeI32)

export const U16 = new CodecImpl('u16', encodeU16, decodeU16)
export const I16 = new CodecImpl('i16', encodeI16, decodeI16)

export const U8 = new CodecImpl('u8', encodeU8, decodeU8)
export const I8 = new CodecImpl('i8', encodeI8, decodeI8)

export const Str = new CodecImpl('str', encodeStr, decodeStr)

export const Bool = new CodecImpl('bool', encodeBool, decodeBool)

export const Void = new CodecImpl('void', encodeVoid, decodeVoid)

export const VecU8 = new CodecImpl('VecU8', encodeUint8Vec, decodeUint8Vec)

export const Compact = new CodecImpl('compact', encodeCompact, decodeCompact)
