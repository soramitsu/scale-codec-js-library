import JSBI from 'jsbi';
import { encodeBigInt } from '../primitives';
import { MAX_U16, MAX_U32, MAX_U8 } from '../consts';
import { assert, concatUint8Arrays } from '@scale-codec/util';

/**
 * @describe Encodes a number into a compact representation
 */
export function encodeBigIntCompact(bn: JSBI): Uint8Array {
    if (JSBI.lessThanOrEqual(bn, MAX_U8)) {
        return new Uint8Array([JSBI.toNumber(bn) << 2]);
    } else if (JSBI.lessThanOrEqual(bn, MAX_U16)) {
        return encodeBigInt(JSBI.add(JSBI.BigInt(1), JSBI.leftShift(bn, JSBI.BigInt(2))), {
            bits: 16,
            endianness: 'le',
            signed: false,
        });
    } else if (JSBI.lessThanOrEqual(bn, MAX_U32)) {
        return encodeBigInt(JSBI.add(JSBI.BigInt(2), JSBI.leftShift(bn, JSBI.BigInt(2))), {
            bits: 32,
            endianness: 'le',
            signed: false,
        });
    }

    const u8a = encodeBigInt(bn, {
        signed: false,
        endianness: 'le',
        // using the most reasonable max bits
        bits: 128,
    });
    let length = u8a.length;

    // adjust to the minimum number of bytes
    while (u8a[length - 1] === 0) {
        length--;
    }

    assert(length >= 4, 'Invalid length, previous checks match anything less than 2^30');

    return concatUint8Arrays([
        // subtract 4 as minimum (also catered for in decoding)
        Uint8Array.from([((length - 4) << 2) + 0b11]),
        u8a.subarray(0, length),
    ]);
}
