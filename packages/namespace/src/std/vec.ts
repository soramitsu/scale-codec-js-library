import { Codec, decodeCompact, decodeVec, encodeCompact, encodeVec } from '@scale-codec/core';
import { concatUint8Arrays } from '@scale-codec/util';
import { NamespaceCodec } from '../types';
import JSBI from 'jsbi';

export function defVec<N, K extends keyof N>(itemRef: K): NamespaceCodec<N[K][], N> {
    return {
        setup({ dynCodec }) {
            const { encode, decode } = dynCodec(itemRef);

            return {
                encode: (v) => encodeVec(v, encode),
                decode: (b) => decodeVec(b, decode),
            };
        },
    };
}

export const BYTES_VECTOR_CODEC: Codec<Uint8Array> = {
    encode: (decoded) => {
        return concatUint8Arrays([encodeCompact(JSBI.BigInt(decoded.length)), decoded]);
    },
    decode: (encoded) => {
        const [lenBN, offset] = decodeCompact(encoded);
        const len = JSBI.toNumber(lenBN);
        return [encoded.subarray(offset, offset + len), offset + len];
    },
};
