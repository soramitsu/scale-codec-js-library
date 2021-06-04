import { TextEncoder, TextDecoder } from 'web-encoding';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

export function decodeStr(bytes: Uint8Array): string {
    return decoder.decode(bytes);
}

export function encodeStr(str: string): Uint8Array {
    return encoder.encode(str);
}
