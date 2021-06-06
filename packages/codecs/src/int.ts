import JSBI from 'jsbi';
import BN from 'bn.js';
import { bytesToHex } from 'hada';

// JSBI

export type Endianness = 'le' | 'be';

export type AllowedBits = -1 | 8 | 16 | 32 | 64 | 128 | 256; // and so on, but let's be realistic

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
export function decodeBigInt(bytes: Uint8Array, options?: BigIntDecodeOptions): JSBI {
    const endianness = options?.endianness ?? 'le';
    const isSigned = options?.isSigned ?? false;
    const bits = options?.bits ?? -1;

    const hex = bytesToHex(Array.from(bits === -1 ? bytes : bytes.subarray(0, bits / 8)));

    const bn = new BN(hex, 16, endianness);

    // fromTwos takes as parameter the number of bits, which is the hex length
    // multiplied by 4.
    const withSign = isSigned ? bn.fromTwos(hex.length * 4) : bn;

    return JSBI.BigInt(withSign.toString());
}
