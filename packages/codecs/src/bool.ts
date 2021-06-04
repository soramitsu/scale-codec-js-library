export function decodeBool(bytes: Uint8Array): boolean {
    return bytes[0] === 1;
}

export function encodeBool(bool: boolean): Uint8Array {
    return new Uint8Array([bool ? 1 : 0]);
}
