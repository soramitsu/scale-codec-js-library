export * from './bool';
export * from './string';
export * from './numbers';
export * from './enum';
export * from './struct';
export * from './tuple';
export * from './vec';
export * from './map';

import JSBI from 'jsbi';
import { NamespaceAsCodecs } from '../types';
import { BoolCodec } from './bool';
import { i16, i32, i64, i8, u16, u32, u64, u8 } from './numbers';
import { StringCodec } from './string';

export interface PrimitiveTypes {
    String: string;
    bool: boolean;
    u8: JSBI;
    u16: JSBI;
    u32: JSBI;
    u64: JSBI;
    i8: JSBI;
    i16: JSBI;
    i32: JSBI;
    i64: JSBI;
}

export const PrimitiveCodecs: NamespaceAsCodecs<PrimitiveTypes> = {
    String: StringCodec,
    bool: BoolCodec,
    u8: u8,
    u16: u16,
    u32: u32,
    u64: u64,
    i8: i8,
    i16: i16,
    i32: i32,
    i64: i64,
};
