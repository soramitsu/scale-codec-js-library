import { assert } from '@scale-codec/util';
import { DecodeResult } from '../types';

export function decodeBool(bytes: Uint8Array): DecodeResult<boolean> {
    assert(bytes.length >= 1, () => `for bool decoding should be at least 1 byte`);
    return [bytes[0] === 1, 1];
}

export function encodeBool(bool: boolean): Uint8Array {
    return new Uint8Array([bool ? 1 : 0]);
}
