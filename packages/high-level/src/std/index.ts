export * from './bool';
export * from './string';
export * from './numbers';
export * from './enum';
export * from './struct';
export * from './tuple';
export * from './vec';
export * from './map';

import { BoolCodec } from './bool';
import { NumberCodec } from './numbers';
import { StringCodec } from './string';
import { EmptyTupleCodec } from './tuple';

export type PrimitiveTypes = {
    String: string;
    bool: boolean;
    u8: number;
    u16: number;
    u32: number;
    u64: number;
    u128: number;
    u256: number;
    i8: number;
    i16: number;
    i32: number;
    i64: number;
    i128: number;
    i256: number;
    '()': null;
};

export const PrimitiveCodecs = {
    String: StringCodec,
    bool: BoolCodec,
    u8: NumberCodec(8, false),
    u16: NumberCodec(8, false),
    u32: NumberCodec(8, false),
    u64: NumberCodec(8, false),
    u128: NumberCodec(8, false),
    u256: NumberCodec(8, false),
    i8: NumberCodec(8, false),
    i16: NumberCodec(8, false),
    i32: NumberCodec(8, false),
    i64: NumberCodec(8, false),
    i128: NumberCodec(8, false),
    i256: NumberCodec(8, false),
    '()': EmptyTupleCodec,
};
