import { Encode, Walker } from '../types'
import {
    decodeBigInt,
    encodeBigInt,
    decodeBigIntVarious,
    countPositiveBigIntEffectiveBytes,
    encodePositiveBigIntIntoSlice,
} from './int'

const MAX_U8 = 2n ** (8n - 2n) - 1n
const MAX_U16 = 2n ** (16n - 2n) - 1n
const MAX_U32 = 2n ** (32n - 2n) - 1n

/**
 * Decodes compact-encoded integer
 */
export function decodeCompact(walker: Walker): bigint {
    const firstByte = walker.arr[walker.offset]
    const flag = firstByte & 0b11

    switch (flag) {
        case 0b00:
            walker.offset++
            return BigInt(firstByte >> 2)
        case 0b01:
            return decodeBigInt(walker, 'u16') >> 2n
        case 0b10:
            return decodeBigInt(walker, 'u32') >> 2n
        default: {
            const bytesCount = (firstByte >> 2) + 4
            walker.offset++
            const value = decodeBigIntVarious(walker, bytesCount, false)
            walker.offset += bytesCount
            return value
        }
    }
}

function compactSizeHint(value: bigint | number): number {
    if (value <= MAX_U8) {
        return 1
    }
    if (value <= MAX_U16) {
        return 2
    }
    if (value <= MAX_U32) {
        return 4
    }
    return 1 + countPositiveBigIntEffectiveBytes(BigInt(value))
}

export const encodeCompact: Encode<bigint | number> = (value, walker) => {
    if (!(value >= 0 && (Number.isInteger(value) || typeof value === 'bigint')))
        throw new Error(`Invalid number is passed: ${value}. It should be non-negative integer.`)

    if (value <= MAX_U8) {
        walker.arr[walker.offset++] = Number(value) << 2
        return
    }
    if (value <= MAX_U16) {
        encodeBigInt((BigInt(value) << 2n) + 0b01n, 'u16', walker)
        return
    }
    if (value <= MAX_U32) {
        encodeBigInt((BigInt(value) << 2n) + 0b10n, 'u32', walker)
        return
    }

    const bytesLength = encodePositiveBigIntIntoSlice(
        BigInt(value),
        walker.arr,
        walker.offset + 1,
        // No limit
        Infinity,
    )
    walker.arr[walker.offset] = ((bytesLength - 4) << 2) + 0b11
    walker.offset += 1 + bytesLength
}

encodeCompact.sizeHint = compactSizeHint
