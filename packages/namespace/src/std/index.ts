export * from './bool';
export * from './string';
export * from './numbers';
export * from './enum';
export * from './struct';
export * from './tuple';
export * from './vec';
export * from './map';
export * from './array';

import JSBI from 'jsbi';
import { Codec } from '@scale-codec/core';
import { bool } from './bool';
import { i16, i32, i64, i8, u16, u32, u64, u8, i128, u128 } from './numbers';
import { str } from './string';

export type StdTypes = {
    str: string;
    bool: boolean;
    u8: JSBI;
    u16: JSBI;
    u32: JSBI;
    u64: JSBI;
    u128: JSBI;
    i8: JSBI;
    i16: JSBI;
    i32: JSBI;
    i64: JSBI;
    i128: JSBI;
    '()': null;
};

type AsCodecs<T> = {
    [K in keyof T]: Codec<T[K]>;
};

export const StdCodecs: AsCodecs<StdTypes> = {
    str,
    bool,
    u8,
    u16,
    u32,
    u64,
    i8,
    i16,
    i32,
    i64,
    u128,
    i128,
    '()': {
        encode: () => new Uint8Array([]),
        decode: () => [null, 0],
    },
};
