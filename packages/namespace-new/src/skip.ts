import { Encode } from '@scale-codec/core';

const EncodeSkipBrand = Symbol('asd');

export type EncodeSkippable = {
    readonly [EncodeSkipBrand]: true;
    readonly bytes: Uint8Array;
};

export function skipEncode(bytes: Uint8Array): EncodeSkippable {
    return {
        [EncodeSkipBrand]: true,
        bytes,
    };
}

export function isEncodeSkippable(val: unknown): val is EncodeSkippable {
    return !!(val && (val as EncodeSkippable)[EncodeSkipBrand]);
}

export function respectSkip<T>(val: T | EncodeSkippable, encode: Encode<T>): Uint8Array {
    return isEncodeSkippable(val) ? val.bytes : encode(val);
}

export function wrapSkippableEncode<T>(encode: Encode<T>): Encode<T | EncodeSkippable> {
    return (v) => respectSkip(v, encode);
}
