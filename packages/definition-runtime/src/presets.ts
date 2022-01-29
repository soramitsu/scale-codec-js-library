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
import { createBuilder } from './fragment'

export const U8 = createBuilder('u8', encodeU8, decodeU8)
export const I8 = createBuilder('i8', encodeI8, decodeI8)

export const U16 = createBuilder('u16', encodeU16, decodeU16)
export const I16 = createBuilder('i16', encodeI16, decodeI16)

export const U32 = createBuilder('u32', encodeU32, decodeU32)
export const I32 = createBuilder('i32', encodeI32, decodeI32)

export const U64 = createBuilder('u64', encodeU64, decodeU64)
export const I64 = createBuilder('i64', encodeI64, decodeI64)

export const U128 = createBuilder('u128', encodeU128, decodeU128)
export const I128 = createBuilder('i128', encodeI128, decodeI128)

export const Str = createBuilder<string>('Str', encodeStr, decodeStr)

export const Bool = createBuilder<boolean>('Bool', encodeBool, decodeBool)

export const BytesVec = createBuilder<Uint8Array>('BytesVec', encodeUint8Vec, decodeUint8Vec)

export const Compact = createBuilder<bigint>('Compact', encodeCompact, decodeCompact)

export const Void = createBuilder<null>('Void', encodeVoid, decodeVoid)
