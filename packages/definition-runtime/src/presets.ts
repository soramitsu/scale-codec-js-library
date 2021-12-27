import {
    BigIntTypes,
    decodeBool,
    decodeCompact,
    decodeStr,
    decodeUint8Vec,
    decodeVoid,
    encodeBool,
    encodeCompact,
    encodeStr,
    encodeUint8Vec,
    encodeVoid,
    IntTypes,
} from '@scale-codec/core'
import { createBigIntBuilder, createIntBuilder } from './builder-creators'
import { createBuilder, FragmentBuilder } from './fragment'

function intBuilder(ty: IntTypes): FragmentBuilder<number> {
    return createIntBuilder(ty.toUpperCase(), ty)
}

function bigIntBuilder(ty: BigIntTypes): FragmentBuilder<bigint> {
    return createBigIntBuilder(ty.toUpperCase(), ty)
}

export const U8 = intBuilder('u8')
export const I8 = intBuilder('i8')
export const U16 = intBuilder('u16')
export const I16 = intBuilder('i16')
export const U32 = intBuilder('u32')
export const I32 = intBuilder('i32')
export const U64 = bigIntBuilder('u64')
export const I64 = bigIntBuilder('i64')
export const U128 = bigIntBuilder('u128')
export const I128 = bigIntBuilder('i128')

export const Str = createBuilder<string>('Str', encodeStr, decodeStr)

export const Bool = createBuilder<boolean>('Bool', encodeBool, decodeBool)

export const BytesVec = createBuilder<Uint8Array>('BytesVec', encodeUint8Vec, decodeUint8Vec)

export const Compact = createBuilder<bigint>('Compact', encodeCompact, decodeCompact)

export const Void = createBuilder<null>('Void', encodeVoid, decodeVoid)
