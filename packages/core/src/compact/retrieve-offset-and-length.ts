import JSBI from 'jsbi';
import { AllowedBits, decodeBigInt } from '../primitives/int';

/**
 * Retrievs the offset and encoded length from a compact-prefixed value
 */
export function retrieveOffsetAndEncodedLength(bytes: Uint8Array): [number, JSBI] {
    const flag = bytes[0] & 0b11;

    if (flag === 0b00) {
        return [1, JSBI.signedRightShift(JSBI.BigInt(bytes[0]), JSBI.BigInt(2))];
    } else if (flag === 0b01) {
        return [
            2,
            JSBI.signedRightShift(
                decodeBigInt(bytes, {
                    bits: 16,
                    signed: false,
                    endianness: 'le',
                })[0],
                JSBI.BigInt(2),
            ),
        ];
    } else if (flag === 0b10) {
        return [
            4,
            JSBI.signedRightShift(
                decodeBigInt(bytes, {
                    signed: false,
                    bits: 32,
                    endianness: 'le',
                })[0],
                JSBI.BigInt(2),
            ),
        ];
    }

    const bigIntBytesCount = JSBI.toNumber(
        JSBI.add(JSBI.signedRightShift(JSBI.BigInt(bytes[0]), JSBI.BigInt(2)), JSBI.BigInt(4)),
    );

    const offset = 1 + bigIntBytesCount;

    return [
        offset,
        decodeBigInt(bytes.subarray(1, offset), {
            bits: (bigIntBytesCount * 8) as AllowedBits,
            endianness: 'le',
            signed: false,
        })[0],
    ];
}
