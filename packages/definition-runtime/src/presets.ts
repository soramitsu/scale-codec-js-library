import {
    AllowedBits,
    decodeBool,
    decodeCompact,
    decodeStr,
    decodeUint8Vec,
    decodeVoid,
    encodeBool,
    encodeCompact,
    encodeStr,
    encodeUint8Vec,
    encodeVoid,
    JSBI,
} from '@scale-codec/core';
import { createBigIntBuilder } from './builder-creators';
import { createBuilder, FragmentBuilder } from './fragment';

function biBuilder(bits: AllowedBits, signed: boolean): FragmentBuilder<JSBI> {
    return createBigIntBuilder(`${signed ? 'U' : 'I'}${bits}`, bits as AllowedBits, signed);
}

export const U8 = biBuilder(8, false);
export const I8 = biBuilder(8, true);
export const U16 = biBuilder(16, false);
export const I16 = biBuilder(16, true);
export const U32 = biBuilder(32, false);
export const I32 = biBuilder(32, true);
export const U64 = biBuilder(64, false);
export const I64 = biBuilder(64, true);
export const U128 = biBuilder(128, false);
export const I128 = biBuilder(128, true);

export const Str = createBuilder<string>('Str', encodeStr, decodeStr);

export const Bool = createBuilder<boolean>('Bool', encodeBool, decodeBool);

export const BytesVec = createBuilder<Uint8Array>('BytesVec', encodeUint8Vec, decodeUint8Vec);

export const Compact = createBuilder<JSBI>('Compact', encodeCompact, decodeCompact);

export const Void = createBuilder<null>('Void', encodeVoid, decodeVoid);
