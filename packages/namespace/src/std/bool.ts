import { decodeBool, encodeBool, Codec } from '@scale-codec/core';

export const BoolCodec: Codec<boolean> = {
    encode: encodeBool,
    decode: decodeBool,
};
