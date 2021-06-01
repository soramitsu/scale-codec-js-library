import { CodecOptions } from './types';

export const StringCodec: CodecOptions<any, string> = {
    encode: (root, val) => new Uint8Array(),
    decode: (root, buff) => buff.toString(),
};
