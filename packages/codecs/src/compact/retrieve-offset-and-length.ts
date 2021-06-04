// import BN from 'bn.js';
import JSBI from 'jsbi';
import { decodeBigInt } from '../int';

/**
 * Retrievs the offset and encoded length from a compact-prefixed value
 */
export function retrieveOffsetAndEncodedLength(bytes: Uint8Array): [number, JSBI] {
    const flag = bytes[0] & 0b11;

    if (flag === 0b00) {
        return [1, JSBI.signedRightShift(JSBI.BigInt(bytes[0]), JSBI.BigInt(2))];
    } else if (flag === 0b01) {
        return [2, JSBI.signedRightShift(decodeBigInt(bytes.slice(0, 2)), JSBI.BigInt(2))];
    } else if (flag === 0b10) {
        return [4, JSBI.signedRightShift(decodeBigInt(bytes.slice(0, 4)), JSBI.BigInt(2))];
    }

    const offset =
        1 + JSBI.toNumber(JSBI.add(JSBI.signedRightShift(JSBI.BigInt(bytes[0]), JSBI.BigInt(2)), JSBI.BigInt(4)));

    return [offset, decodeBigInt(bytes.subarray(1, offset))];
}
