import JSBI from 'jsbi';
import { TextEncoder, TextDecoder } from 'web-encoding';
import { compactAddLength, retrieveOffsetAndEncodedLength } from './compact';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {
    // do not allow invalid utf-8 sequences
    fatal: true,
});

export function decodeStr(bytes: Uint8Array): string {
    return decoder.decode(bytes);
}

export function encodeStr(str: string): Uint8Array {
    return encoder.encode(str);
}

export function decodeStrCompact(buff: Uint8Array): [string, number] {
    const [offset, length] = retrieveOffsetAndEncodedLength(buff);
    const lenNum = JSBI.toNumber(length);
    const total = offset + lenNum;

    // assert(length.lten(MAX_LENGTH), () => `Text: length ${length.toString()} exceeds ${MAX_LENGTH}`);
    // assert(total <= value.length, () => `Text: required length less than remainder, expected at least ${total}, found ${value.length}`);

    return [decodeStr(buff.subarray(offset, total)), offset + lenNum];
}

export function encodeStrCompact(str: string): Uint8Array {
    const encoded = encodeStr(str);
    return compactAddLength(encoded);
}
