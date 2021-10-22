import {
    AllowedBits,
    decodeBool,
    decodeCompact,
    decodeStrCompact,
    decodeUint8Vec,
    decodeVoid,
    encodeBool,
    encodeCompact,
    encodeStrCompact,
    encodeUint8Vec,
    encodeVoid,
    JSBI,
} from '@scale-codec/core';
import { createBigIntBuilder } from './builder-creators';
import { createScaleBuilder, ScaleBuilder } from './instance';

function* createBigIntBuilders(): Generator<ScaleBuilder<JSBI>> {
    for (const signed of [false, true]) {
        for (let bits = 8; bits <= 128; bits *= 2) {
            yield createBigIntBuilder(`${signed ? 'U' : 'I'}${bits}`, bits as AllowedBits, signed);
        }
    }
}

// fixme separate for tree-shaking
export const [U8, U16, U32, U64, U128, I8, I16, I32, I64, I128] = createBigIntBuilders();

export const Str = createScaleBuilder<string>('Str', encodeStrCompact, decodeStrCompact);

export const Bool = createScaleBuilder<boolean>('Bool', encodeBool, decodeBool);

export const BytesVec = createScaleBuilder<Uint8Array>('BytesVec', encodeUint8Vec, decodeUint8Vec);

export const Compact = createScaleBuilder<JSBI>('Compact', encodeCompact, decodeCompact);

export const Void = createScaleBuilder<null>('Void', encodeVoid, decodeVoid);
