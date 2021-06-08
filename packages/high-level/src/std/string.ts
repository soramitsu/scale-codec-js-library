import { decodeStrCompact, encodeStrCompact, Codec } from '@scale-codec/core';

export const StringCodec: Codec<string> = {
    encode: encodeStrCompact,
    decode: decodeStrCompact,
};
