import JSBI from 'jsbi';
import { encodeBigInt } from '../int';
import { BI_2, BI_1, MAX_U16, MAX_U32, MAX_U8 } from '../consts';
import { assert, concatUint8Arrays } from '@scale-codec/util';

/**
 * @describe Encodes a number into a compact representation
 */
export function encodeBigIntCompact(bn: JSBI): Uint8Array {
    if (JSBI.lessThanOrEqual(bn, MAX_U8)) {
        return new Uint8Array([JSBI.toNumber(bn) << 2]);
    } else if (JSBI.lessThanOrEqual(bn, MAX_U16)) {
        return encodeBigInt(JSBI.add(BI_1, JSBI.leftShift(bn, BI_2)), { bits: 16 });
    } else if (JSBI.lessThanOrEqual(bn, MAX_U32)) {
        return encodeBigInt(JSBI.add(BI_2, JSBI.leftShift(bn, BI_2)), { bits: 32 });
    }

    const u8a = encodeBigInt(bn);
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
