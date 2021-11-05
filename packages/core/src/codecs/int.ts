import { assert } from '@scale-codec/util';
import { DecodeResult } from '../types';
import { mapDecodeResult } from '../util';

/**
 * Set of integer types that are supported by codec for `number`
 */
export type IntTypes = `${'i' | 'u'}${8 | 16 | 32}`;

/**
 * Set of integer types that are supported by codec for `bigint`
 */
export type BigIntTypes = IntTypes | `${'i' | 'u'}${64 | 128 | 256 | 512}`;

type BigIntNativeSupported = `${'i' | 'u'}64`;

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
};

function isBigIntTyNativeSupported(ty: BigIntTypes): ty is BigIntNativeSupported {
    return INT_BYTES_COUNT_MAP[ty] === 8;
}

function isIntTy(ty: BigIntTypes): ty is IntTypes {
    return INT_BYTES_COUNT_MAP[ty] <= 4;
}

const INT_SETTERS: { [K in IntTypes]: (value: number, view: DataView) => void } = {
    u8: (n, v) => v.setUint8(0, n),
    i8: (n, v) => v.setInt8(0, n),
    u16: (n, v) => v.setUint16(0, n, true),
    i16: (n, v) => v.setInt16(0, n, true),
    u32: (n, v) => v.setUint32(0, n, true),
    i32: (n, v) => v.setInt32(0, n, true),
};

const INT_GETTERS: { [K in IntTypes]: (view: DataView) => number } = {
    u8: (d) => d.getUint8(0),
    i8: (d) => d.getInt8(0),
    u16: (d) => d.getUint16(0, true),
    i16: (d) => d.getInt16(0, true),
    u32: (d) => d.getUint32(0, true),
    i32: (d) => d.getInt32(0, true),
};

function isIntTypeSigned(ty: IntTypes | BigIntTypes): boolean {
    return ty[0] === 'i';
}

function checkAndAssertNegation(value: number | bigint, ty: BigIntTypes): boolean {
    const isNegative = value < 0;
    const isTySigned = isIntTypeSigned(ty);
    assert(!isNegative || isTySigned, () => `Negative num (${value}) passed to unsigned ("${ty}") encoder`);

    return isNegative;
}

/**
 * Encodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function encodeInt(value: number, ty: IntTypes): Uint8Array {
    checkAndAssertNegation(value, ty);
    assert(Number.isSafeInteger(value), () => `Unsafe integer (${value}) is passed into encoder`);

    const arr = new Uint8Array(INT_BYTES_COUNT_MAP[ty]);
    const view = new DataView(arr.buffer);
    INT_SETTERS[ty](value, view);
    return arr;
}

/**
 * Decodes signed/unsigned 8/16/32 bits integers in Little-Endian
 */
export function decodeInt(input: Uint8Array, ty: IntTypes): DecodeResult<number> {
    const bytes = INT_BYTES_COUNT_MAP[ty];
    const view = new DataView(input.buffer, input.byteOffset);
    const value = INT_GETTERS[ty](view);
    return [value, bytes];
}

const BIG_INT_SETTERS: { [K in BigIntNativeSupported]: (value: bigint, view: DataView) => void } = {
    u64: (i, v) => v.setBigUint64(0, i, true),
    i64: (i, v) => v.setBigInt64(0, i, true),
};

const BIG_INT_GETTERS: { [K in BigIntNativeSupported]: (view: DataView) => bigint } = {
    u64: (v) => v.getBigUint64(0, true),
    i64: (v) => v.getBigInt64(0, true),
};

function encodeBINativeSupported(bi: bigint, ty: BigIntNativeSupported): Uint8Array {
    const arr = new Uint8Array(INT_BYTES_COUNT_MAP[ty]);
    const view = new DataView(arr.buffer);
    BIG_INT_SETTERS[ty](bi, view);
    return arr;
}

function decodeBINativeSupported(bytes: Uint8Array, ty: BigIntNativeSupported): DecodeResult<bigint> {
    const bytesCount = INT_BYTES_COUNT_MAP[ty];
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const value = BIG_INT_GETTERS[ty](view);
    return [value, bytesCount];
}

class LittleEndianBytesView {
    public readonly arr: Uint8Array;

    public constructor(bytes: number, source?: Uint8Array) {
        if (source) {
            assert(source.length >= bytes, () => `expected at least ${bytes} bytes, received: ${source.length}`);

            // it is important to get slice copy of array, not a subarray of the source, because
            // mutations on subarray will affect source.
            this.arr = source.slice(0, bytes);
        } else {
            this.arr = new Uint8Array(bytes);
        }
    }

    public readAt(index: number): number {
        return this.arr[index];
    }

    public writeAt(index: number, byte: number) {
        this.arr[index] = byte;
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

/**
 * Encodes `bigint` in Little-Endian
 */
export function encodeBigInt(bi: bigint, ty: BigIntTypes): Uint8Array {
    const isNegative = checkAndAssertNegation(bi, ty);

    // check for more optimized ways first
    if (isIntTy(ty)) {
        return encodeInt(Number(bi), ty);
    }
    if (isBigIntTyNativeSupported(ty)) {
        return encodeBINativeSupported(bi, ty);
    }

    // prepare
    const bytes = INT_BYTES_COUNT_MAP[ty];
    const view = new LittleEndianBytesView(bytes);

    // iteration
    let iterValue = isNegative ? -bi : bi;
    let i = 0;
    let rem: number;
    while (iterValue > 0) {
        rem = Number(iterValue % 256n);
        view.writeAt(i++, rem);
        iterValue /= 256n;
    }

    // final chords
    isNegative && view.transformByTwosComplement();

    return view.arr;
}

/**
 * Decodes `bigint` in Little-Endian. It is like {@link decodeBigInt} but is not
 * binded to strict bytes count (1, 2, 4, 8, 16 etc)
 */
export function decodeBigIntVarious(input: Uint8Array, bytes: number, signed: boolean): DecodeResult<bigint> {
    const view = new LittleEndianBytesView(bytes, input);

    // negation analysis & transformation
    let isNegative = false;
    if (signed) {
        const mostSignificantBit = (view.readAt(bytes - 1) & 0b1000_0000) >> 7;
        isNegative = mostSignificantBit === 1;
        isNegative && view.transformByTwosComplement();
    }

    // iteration
    let value = 0n;
    for (let i = 0, mul = 1n; i < bytes; i++, mul *= 256n) {
        value += mul * BigInt(view.readAt(i));
    }

    // apply negation
    isNegative && (value = -value);

    return [value, bytes];
}

/**
 * Decodes `bigint` in Little-Endian
 */
export function decodeBigInt(input: Uint8Array, ty: BigIntTypes): DecodeResult<bigint> {
    if (isIntTy(ty)) {
        return mapDecodeResult(decodeInt(input, ty), (num) => BigInt(num));
    }
    if (isBigIntTyNativeSupported(ty)) {
        return decodeBINativeSupported(input, ty);
    }

    const isTySigned = isIntTypeSigned(ty);
    const bytes = INT_BYTES_COUNT_MAP[ty];
    return decodeBigIntVarious(input, bytes, isTySigned);
}
