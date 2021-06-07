import JSBI from 'jsbi';
import BN from 'bn.js';
import { bytesToHex } from 'hada';
import { DecodeResult } from './types';

export type Endianness = 'le' | 'be';

export type AllowedBits = -1 | 8 | 16 | 32 | 64 | 128 | 256; // and so on, but let's be realistic

// /**
//  * Code extracted & transformed from
//  * https://github.com/consento-org/bigint-codec/tree/002d910fb24f389c573ccd03de06ec006ce438eb
//  */
// const codecs: {
//     [e in Endianness]: {
//         [s in 'int' | 'uint']: {
//             encode: (val: JSBI) => Iterable<number>;
//             decode: (bytes: Iterable<number>) => JSBI;
//         };
//     };
// } = {
//     le: {
//         int: {
//             *encode(val) {
//                 let bigint = val;
//                 if (JSBI.lessThan(bigint, JSBI.BigInt(0))) {
//                     if (JSBI.equal(bigint, JSBI.BigInt(-1))) {
//                         yield 0xff;
//                         return;
//                     }
//                     bigint = JSBI.subtract(JSBI.multiply(bigint, JSBI.BigInt(-1)), JSBI.BigInt(-1));
//                     while (JSBI.greaterThanOrEqual(bigint, JSBI.BigInt(256))) {
//                         yield 255 - JSBI.toNumber(JSBI.remainder(bigint, JSBI.BigInt(256)));
//                         bigint = JSBI.signedRightShift(bigint, JSBI.BigInt(8));
//                     }
//                     const last = 255 - Number(bigint);
//                     yield last;
//                     if (last < 128) {
//                         yield 0xff;
//                     }
//                     return;
//                 }
//                 while (JSBI.greaterThanOrEqual(bigint, JSBI.BigInt(256))) {
//                     yield JSBI.toNumber(JSBI.bitwiseAnd(bigint, JSBI.BigInt(255)));
//                     bigint = JSBI.signedRightShift(bigint, JSBI.BigInt(8));
//                 }
//                 yield Number(bigint);
//                 if (JSBI.greaterThan(bigint, JSBI.BigInt(127))) {
//                     yield 0;
//                 }
//             },
//             decode(bytes) {
//                 let result = JSBI.BigInt(0);
//                 let last = 0;
//                 let shift = JSBI.BigInt(0);
//                 let mask = JSBI.BigInt(255);
//                 for (const byte of bytes) {
//                     last = byte;
//                     result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(byte), shift));
//                     mask = JSBI.bitwiseOr(mask, JSBI.leftShift(JSBI.BigInt(255), shift));
//                     shift = JSBI.add(shift, JSBI.BigInt(8));
//                 }
//                 if (last >= 128) {
//                     result = JSBI.subtract(
//                         JSBI.multiply(JSBI.bitwiseXor(mask, result), JSBI.BigInt(-1)),
//                         JSBI.BigInt(1),
//                     );
//                 }
//                 return result;
//             },
//         },
//         uint: {
//             *encode(val) {
//                 let bigint = val;
//                 if (JSBI.lessThan(bigint, JSBI.BigInt(0))) {
//                     throw new Error(`Encoding a negative ${bigint} with big-uint-le will loose data.`);
//                 }
//                 while (JSBI.greaterThanOrEqual(bigint, JSBI.BigInt(256))) {
//                     yield JSBI.toNumber(JSBI.bitwiseAnd(bigint, JSBI.BigInt(255)));
//                     bigint = JSBI.signedRightShift(bigint, JSBI.BigInt(8));
//                 }
//                 yield Number(bigint);
//             },
//             decode(bytes) {
//                 let result = JSBI.BigInt(0);
//                 let shift = JSBI.BigInt(0);
//                 for (const byte of bytes) {
//                     result = JSBI.add(result, JSBI.leftShift(JSBI.BigInt(byte), shift));
//                     shift = JSBI.add(shift, JSBI.BigInt(8));
//                 }
//                 return result;
//             },
//         },
//     },
//     be: null as any
// };

export interface NumberEncodeOptions {
    /**
     * @default -1
     */
    bits?: AllowedBits;

    /**
     * @default 'le'
     */
    endianness?: Endianness;

    /**
     * @default false
     */
    isSigned?: boolean;
}

/**
 * TODO remove bn.js dependency
 */
export function encodeBigInt(value: JSBI, options?: NumberEncodeOptions): Uint8Array {
    const bits = options?.bits ?? -1;
    const endianness: Endianness = options?.endianness ?? 'le';
    const isSigned = options?.isSigned ?? false;

    const bn = new BN(value.toString());

    const byteLength = Math.ceil((bits === -1 ? bn.bitLength() : bits || 0) / 8);

    if (!byteLength) {
        return new Uint8Array();
    }

    const output = new Uint8Array(byteLength);

    const bnWithSign = isSigned ? bn.toTwos(byteLength * 8) : bn;
    output.set(bnWithSign.toArray(endianness, byteLength), 0);

    return output;
}

export interface BigIntDecodeOptions {
    /**
     * @default 'le'
     */
    endianness?: Endianness;

    /**
     * @default false
     */
    isSigned?: boolean;

    /**
     * If bits is -1 then all bytes will be decoded else will be taken subarray of bits
     *
     * @default -1
     */
    bits?: AllowedBits;
}

/**
 * TODO remove bn.js
 */
export function decodeBigInt(bytes: Uint8Array, options?: BigIntDecodeOptions): DecodeResult<JSBI> {
    const endianness = options?.endianness ?? 'le';
    const isSigned = options?.isSigned ?? false;
    const bits = options?.bits ?? -1;

    const hex = bytesToHex(Array.from(bits === -1 ? bytes : bytes.subarray(0, bits / 8)));

    const bn = new BN(hex, 16, endianness);

    // fromTwos takes as parameter the number of bits, which is the hex length
    // multiplied by 4.
    const withSign = isSigned ? bn.fromTwos(hex.length * 4) : bn;

    return [JSBI.BigInt(withSign.toString()), bits === -1 ? bytes.length : bits / 8];
}
