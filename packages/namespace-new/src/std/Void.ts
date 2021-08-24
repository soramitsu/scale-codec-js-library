import { Codec } from '@scale-codec/namespace-next';

export type Pure = null;

export type Encodable = null;

export const { encode, decode }: Codec<null> = {
    encode: () => new Uint8Array(),
    decode: () => [null, 0],
};
