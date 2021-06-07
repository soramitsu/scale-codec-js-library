import { decodeBool, encodeBool } from '@scale-codec/codecs';
import { Codec } from '../types';

export const BoolCodec: Codec<any, boolean> = {
    type: 'primitive',
    encode: (val) => encodeBool(val),
    decode: (buff) => [decodeBool(buff), 1],
};
