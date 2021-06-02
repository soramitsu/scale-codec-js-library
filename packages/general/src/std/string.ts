import { Codec } from '../types';

export const StringCodec: Codec<any, string> = {
    encode: (root, val) => new Uint8Array(),
    decode: (root, buff) => buff.toString(),
};
