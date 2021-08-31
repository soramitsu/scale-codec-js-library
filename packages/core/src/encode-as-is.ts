import { Encode } from './types';

const EncodeAsIsBrand = Symbol('skip');

/**
 * Bytes that could be skipped during the encoding process and just to be included in the final array of bytes as-is
 */
export type EncodeAsIs = {
    readonly [EncodeAsIsBrand]: true;
    readonly bytes: Uint8Array;
};

/**
 * Mark bytes to use them during the encoding process as already encoded
 */
export function encodeAsIs(bytes: Uint8Array): EncodeAsIs {
    return {
        [EncodeAsIsBrand]: true,
        bytes,
    };
}

/**
 * Checks if the value is bytes wrapped into a `EncodeAsIs`
 */
export function isEncodeAsIsWrapper(val: unknown): val is EncodeAsIs {
    return !!(val && (val as EncodeAsIs)[EncodeAsIsBrand]);
}

/**
 * Receives some value and it's encode function and returns bytes if the value marked to be used as-is
 */
export function respectEncodeAsIs<T>(val: T | EncodeAsIs, encode: Encode<T>): Uint8Array {
    return isEncodeAsIsWrapper(val) ? val.bytes : encode(val);
}

/**
 * Decorator that wraps some encode function into encode function that respects values marked to be used as-is
 */
export function makeEncoderAsIsRespectable<T>(encode: Encode<T>): Encode<T | EncodeAsIs> {
    return (v) => respectEncodeAsIs(v, encode);
}
