import { decodeStrCompact, encodeStrCompact } from '@scale-codec/codecs';
import { Codec } from '../types';

export const StringCodec: Codec<string> = {
    type: 'primitive',
    encode: (val) => encodeStrCompact(val),
    decode: (buff) => decodeStrCompact(buff),
};
