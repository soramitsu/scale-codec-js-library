import { assert } from '@scale-codec/util'
import { Walker, Encode, Decode } from '../types'
import { encodeFactory } from '../util'

/**
 * Set of integer types that are supported by codec for `number`
 */
export type IntTypes = `${'i' | 'u'}${8 | 16 | 32}`

/**
 * Set of integer types that are supported by codec for `bigint`
 */
export type BigIntTypes = IntTypes | `${'i' | 'u'}${64 | 128 | 256 | 512}`

type BigIntNativeSupported = `${'i' | 'u'}64`

const INT_BYTES_COUNT_MAP: { [K in IntTypes | BigIntTypes]: number } = {
    i8: 1,
    u8: 1,
    i16: 2,
    u16: 2,
    i32: 4,
    u32: 4,
    i64: 8,
    u64: 8,
    i128: 16,
    u128: 16,
    i256: 32,
    u256: 32,
    i512: 64,
    u512: 64,
}

const tySizeHint =
    (ty: IntTypes | BigIntTypes): (() => number) =>
    () =>
        INT_BYTES_COUNT_MAP[ty]

const isBigIntTyNativeSupported = (ty: BigIntTypes): ty is BigIntNativeSupported => INT_BYTES_COUNT_MAP[ty] === 8

const isIntTy = (ty: BigIntTypes): ty is IntTypes => INT_BYTES_COUNT_MAP[ty] <= 4

const isIntTypeSigned = (ty: IntTypes | BigIntTypes): boolean => ty[0] === 'i'

function checkNegative(value: number | bigint, ty: BigIntTypes): boolean {
    const isNegative = value < 0
    const isTySigned = isIntTypeSigned(ty)
    assert(!isNegative || isTySigned, () => `Negative num (${value}) is passed to unsigned ("${ty}") encoder`)

    return isNegative
}

/**
 * Encodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function encodeInt(value: number, ty: IntTypes, walker: Walker): void {
    checkNegative(value, ty)
    assert(Number.isSafeInteger(value), () => `Unsafe integer (${value}) is passed into encoder`)

    const { view, offset } = walker

    switch (ty) {
        case 'i8':
            view.setInt8(offset, value)
            break
        case 'u8':
            view.setUint8(offset, value)
            break
        case 'i16':
            view.setInt16(offset, value, true)
            break
        case 'u16':
            view.setUint16(offset, value, true)
            break
        case 'i32':
            view.setInt32(offset, value, true)
            break
        case 'u32':
            view.setUint32(offset, value, true)
            break
    }

    walker.offset += INT_BYTES_COUNT_MAP[ty]
}

/**
 * Decodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function decodeInt(walker: Walker, ty: IntTypes): number {
    const { view, offset } = walker
    let value: number

    switch (ty) {
        case 'i8':
            value = view.getInt8(offset)
            break
        case 'u8':
            value = view.getUint8(offset)
            break
        case 'i16':
            value = view.getInt16(offset, true)
            break
        case 'u16':
            value = view.getUint16(offset, true)
            break
        case 'i32':
            value = view.getInt32(offset, true)
            break
        case 'u32':
            value = view.getUint32(offset, true)
            break
    }

    walker.offset += INT_BYTES_COUNT_MAP[ty]

    return value
}

function encodeBINativeSupported(bi: bigint, ty: BigIntNativeSupported, walker: Walker): void {
    checkNegative(bi, ty)
    const { view, offset } = walker
    switch (ty) {
        case 'u64':
            view.setBigUint64(offset, bi, true)
            break
        case 'i64':
            view.setBigInt64(offset, bi, true)
            break
    }
    walker.offset += INT_BYTES_COUNT_MAP[ty]
}

function decodeBINativeSupported(walker: Walker, ty: BigIntNativeSupported): bigint {
    const { view, offset } = walker
    let value: bigint

    switch (ty) {
        case 'u64':
            value = view.getBigUint64(offset, true)
            break
        case 'i64':
            value = view.getBigInt64(offset, true)
            break
    }

    walker.offset += INT_BYTES_COUNT_MAP[ty]

    return value
}

// TODO compare with data-view implementation
/**
 * @remarks
 * There was idea to implement it via `DataView`, but `Uint8Array` implementation if faster (in Node)
 * @param slice
 */
function transformByTwosComplementLittleEndian(slice: Uint8Array, offset: number, len: number) {
    // initial addition
    let addition = 1
    for (let i = offset, end = offset + len; i < end; i++) {
        // negate and add
        const newValue = 255 - slice[i] + addition
        // addition to next digit
        addition = newValue > 255 ? 1 : 0
        // writing remainder
        slice[i] = newValue % 256
    }
}

// export function encodeBigIntVarious(biAbs: bigint, bytes: number, isNegative: boolean, writer: Writer) {}

// eslint-disable-next-line max-params
export function encodePositiveBigIntIntoSlice(
    positiveNum: bigint,
    mutSlice: Uint8Array,
    offset: number,
    bytesLimit: number,
): number {
    let i = 0
    let rem: number
    while (positiveNum > 0 && i < bytesLimit) {
        rem = Number(positiveNum % 256n)
        mutSlice[offset + i++] = rem
        // eslint-disable-next-line no-param-reassign
        positiveNum /= 256n
    }
    if (positiveNum > 0) {
        throw new Error(`Number ${positiveNum} is out of bytes limit (${bytesLimit})`)
    }

    return i
}

export function countPositiveBigIntEffectiveBytes(positiveNum: bigint): number {
    let count = 0
    while (positiveNum > 0) {
        count++
        // eslint-disable-next-line no-param-reassign
        positiveNum /= 256n
    }
    return count
}

/**
 * Encodes `bigint` in Little-Endian
 */
export function encodeBigInt(bi: bigint, ty: BigIntTypes, walker: Walker): void {
    // check for more optimal ways first
    if (isIntTy(ty)) {
        return encodeInt(Number(bi), ty, walker)
    }
    if (isBigIntTyNativeSupported(ty)) {
        return encodeBINativeSupported(bi, ty, walker)
    }

    // prepare
    const isNegative = checkNegative(bi, ty)
    const bytes = INT_BYTES_COUNT_MAP[ty]

    // iteration
    encodePositiveBigIntIntoSlice(isNegative ? -bi : bi, walker.arr, walker.offset, bytes)

    // final chords
    isNegative && transformByTwosComplementLittleEndian(walker.arr, walker.offset, bytes)
    walker.offset += bytes
}

const DECODE_BUFFER = new Uint8Array(64)

/**
 * Decodes `bigint` in Little-Endian. It is like {@link decodeBigInt} but is not
 * binded to strict bytes count (1, 2, 4, 8, 16 etc)
 *
 * @remarks
 * Does not mutate walker's offset!
 */
export function decodeBigIntVarious(walker: Walker, bytes: number, signed: boolean): bigint {
    DECODE_BUFFER.set(walker.arr.subarray(walker.offset, walker.offset + bytes), 0)

    // negation analysis & transformation
    let isNegative = false
    if (signed) {
        const mostSignificantBit = (DECODE_BUFFER[bytes - 1] & 0b1000_0000) >> 7
        isNegative = mostSignificantBit === 1
        isNegative && transformByTwosComplementLittleEndian(DECODE_BUFFER, 0, bytes)
    }

    // iteration
    let value = 0n
    for (let i = 0, mul = 1n; i < bytes; i++, mul *= 256n) {
        value += mul * BigInt(DECODE_BUFFER[i])
    }

    // apply negation
    isNegative && (value = -value)

    return value
}

/**
 * Decodes `bigint` in Little-Endian
 */
export function decodeBigInt(walker: Walker, ty: BigIntTypes): bigint {
    if (isIntTy(ty)) {
        return BigInt(decodeInt(walker, ty))
    }
    if (isBigIntTyNativeSupported(ty)) {
        return decodeBINativeSupported(walker, ty)
    }

    const isTySigned = isIntTypeSigned(ty)
    const bytes = INT_BYTES_COUNT_MAP[ty]
    const value = decodeBigIntVarious(walker, bytes, isTySigned)
    walker.offset += bytes
    return value
}

export function createIntEncoder(ty: IntTypes): Encode<number> {
    return encodeFactory((value, writer) => encodeInt(value, ty, writer), tySizeHint(ty))
}

export function createIntDecoder(ty: IntTypes): Decode<number> {
    return (reader) => decodeInt(reader, ty)
}

export function createBigIntEncoder(ty: BigIntTypes): Encode<bigint> {
    return encodeFactory((value, writer) => encodeBigInt(value, ty, writer), tySizeHint(ty))
}

export function createBigIntDecoder(ty: BigIntTypes): Decode<bigint> {
    return (reader) => decodeBigInt(reader, ty)
}
