import { assert, concatUint8Arrays } from '@scale-codec/util';
import { DecodeResult } from '../types';
import { decodeBigInt, encodeBigInt, decodeBigIntVarious } from './int';

const MAX_U8 = 2n ** (8n - 2n) - 1n;
const MAX_U16 = 2n ** (16n - 2n) - 1n;
const MAX_U32 = 2n ** (32n - 2n) - 1n;

/**
 * Decodes compact-encoded integer
 */
export function decodeCompact(input: Uint8Array): DecodeResult<bigint> {
    const flag = input[0] & 0b11;

    if (flag === 0b00) {
        return [BigInt(input[0] >> 2), 1];
    } else if (flag === 0b01) {
        return [decodeBigInt(input, 'u16')[0] >> 2n, 2];
    } else if (flag === 0b10) {
        return [decodeBigInt(input, 'u32')[0] >> 2n, 4];
    }

    const bigIntBytesCount = (input[0] >> 2) + 4;
    const offset = 1 + bigIntBytesCount;
    return [decodeBigIntVarious(input.subarray(1, offset), bigIntBytesCount, false)[0], offset];
}

/**
 * Encodes integer in compact form (efficient for size, unefficient for computations)
 */
export function encodeCompact(value: bigint): Uint8Array {
    if (value <= MAX_U8) {
        return new Uint8Array([Number(value) << 2]);
    }
    if (value <= MAX_U16) {
        return encodeBigInt(1n + (value << 2n), 'u16');
    }
    if (value <= MAX_U32) {
        return encodeBigInt(2n + (value << 2n), 'u32');
    }

    const arr = encodeBigInt(value, 'u128');
    let length = arr.length;

    // adjust to the minimum number of bytes
    while (arr[length - 1] === 0) {
        length--;
    }

    return concatUint8Arrays([
        // subtract 4 as minimum (also catered for in decoding)
        Uint8Array.from([((length - 4) << 2) + 0b11]),
        arr.subarray(0, length),
    ]);
}
