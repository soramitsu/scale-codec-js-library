import { DecodeResult } from '../types';

export function decodeBool(bytes: Uint8Array): DecodeResult<boolean> {
    return [bytes[0] === 1, 1];
}

export function encodeBool(bool: boolean): Uint8Array {
    return new Uint8Array([bool ? 1 : 0]);
}
