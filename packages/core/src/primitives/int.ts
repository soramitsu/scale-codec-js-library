import JSBI from 'jsbi';
import { DecodeResult } from '../types';
import { assert } from '@scale-codec/util';

/**
 * Little-Endian (`le`) or Big-Endian (`be`)
 */
export type Endianness = 'le' | 'be';

export type AllowedBits = 8 | 16 | 32 | 64 | 128; // and so on, but let's be realistic

export interface BigIntCodecOptions {
    bits: AllowedBits;
    endianness: Endianness;
    signed: boolean;
}

class BytesRepr {
    public readonly arr: Uint8Array;

    private idx: (index: number) => number;

    public constructor(bits: AllowedBits, endianess: 'le' | 'be', source?: Uint8Array) {
        const bytes = bits / 8;

        if (source) {
            assert(source.length >= bytes, () => `expected at least ${bytes} bytes, received: ${source.length}`);
            this.arr = source.subarray(0, bytes);
        } else {
            this.arr = new Uint8Array(bytes);
        }

        this.idx = endianess === 'be' ? (i) => bytes - i - 1 : (i) => i;
    }

    public readAt(index: number): number {
        return this.arr[this.idx(index)];
    }

    public writeAt(index: number, byte: number) {
        this.arr[this.idx(index)] = byte;
    }

    public transformByTwosComplement() {
        // initial addition
        let addition = 1;
        for (let i = 0; i < this.arr.length; i++) {
            // negate and add
            const newValue = 255 - this.readAt(i) + addition;
            // addition to next digit
            addition = newValue > 255 ? 1 : 0;
            // writing remainder
            this.writeAt(i, newValue % 256);
        }
    }
}

export function encodeBigInt(value: JSBI, { bits, signed, endianness }: BigIntCodecOptions): Uint8Array {
    const repr = new BytesRepr(bits, endianness);

    const truncated = signed ? JSBI.asIntN(bits, value) : JSBI.asUintN(bits, value);
    const isTruncatedNegative = JSBI.lessThan(truncated, JSBI.BigInt(0));

    // iterate and get remainder from positive num by 256
    let valIter = isTruncatedNegative ? JSBI.unaryMinus(truncated) : truncated;
    let i = 0;
    while (JSBI.greaterThan(valIter, JSBI.BigInt(0))) {
        const rem = JSBI.remainder(valIter, JSBI.BigInt(256));
        repr.writeAt(i++, JSBI.toNumber(rem));
        valIter = JSBI.divide(valIter, JSBI.BigInt(256));
    }

    // if has sign, then as two's complement
    isTruncatedNegative && repr.transformByTwosComplement();

    return repr.arr;
}

export function decodeBigInt(
    bytesArray: Uint8Array,
    { bits, signed, endianness }: BigIntCodecOptions,
): DecodeResult<JSBI> {
    const repr = new BytesRepr(bits, endianness, bytesArray);
    const bytes = bits / 8;

    let negate = false;
    if (signed) {
        const mostSignificantBit = (repr.readAt(bytes - 1) & 0b1000_0000) >> 7;
        negate = mostSignificantBit === 1;
        negate && repr.transformByTwosComplement();
    }

    let valAcc = JSBI.BigInt(0);
    for (let i = 0, mul = JSBI.BigInt(1); i < bytes; i++, mul = JSBI.multiply(mul, JSBI.BigInt(256))) {
        const byte = repr.readAt(i);
        valAcc = JSBI.add(valAcc, JSBI.multiply(JSBI.BigInt(byte), mul));
    }

    const valWithSign = negate ? JSBI.unaryMinus(valAcc) : valAcc;

    return [valWithSign, bytes];
}
