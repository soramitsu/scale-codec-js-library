import { Codec } from '../types';

export const BoolCodec: Codec<any, boolean> = {
    encode: () => new Uint8Array(),
    decode: () => false,
};
