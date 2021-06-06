import JSBI from 'jsbi';
import { decodeBigInt, encodeBigInt } from './int';
import { decodeArrayContainer, encodeArrayContainer } from './containers';
import { decodeStrCompact, encodeStrCompact } from './str';

function hexifyBytes(v: Uint8Array): string {
    return [...v].map((x) => x.toString(16).padStart(2, '0')).join(' ');
}

describe('Vec', () => {
    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1320
    it('vec of u8 encoded as expected', () => {
        const numbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34].map((x) => JSBI.BigInt(x));
        const hex = '28 00 01 01 02 03 05 08 0d 15 22';

        const numEncode = (v: JSBI) => encodeBigInt(v, { bits: 8 });
        const numDecode = (b: Uint8Array): [JSBI, number] => [decodeBigInt(b, { bits: 8 }), 1];

        const encoded = encodeArrayContainer(numbers, numEncode);
        expect(hexifyBytes(encoded)).toEqual(hex);

        const [decoded, len] = decodeArrayContainer(encoded, numDecode);
        expect(decoded).toEqual(numbers);
        expect(len).toEqual(encoded.length);
    });

    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1328
    it('vec of i16 encoded as expected', () => {
        const numbers = [0, 1, -1, 2, -2, 3, -3].map((x) => JSBI.BigInt(x));
        const hex = '1c 00 00 01 00 ff ff 02 00 fe ff 03 00 fd ff';

        const numEncode = (v: JSBI) => encodeBigInt(v, { bits: 16, isSigned: true });
        const numDecode = (b: Uint8Array): [JSBI, number] => [decodeBigInt(b, { bits: 16, isSigned: true }), 2];

        const encoded = encodeArrayContainer(numbers, numEncode);
        expect(hexifyBytes(encoded)).toEqual(hex);

        const [decoded, len] = decodeArrayContainer(encoded, numDecode);
        expect(decoded).toEqual(numbers);
        expect(len).toEqual(encoded.length);
    });

    it('vec encodes only necessary', () => {
        const actualVecHex = '28 00 01 01 02 03 05 08 0d 15 22';
        const actualVecBytes = actualVecHex.split(' ').map((x) => parseInt(x, 16));
        const actualVecBytesLen = actualVecBytes.length;

        const encoded = Uint8Array.from([
            ...actualVecBytes,
            // some noise
            5,
            1,
            6,
            78,
            98,
            9,
            1,
            2,
            3,
            4,
        ]);

        const [_decoded, len] = decodeArrayContainer(encoded, (bytes) => [decodeBigInt(bytes, { bits: 8 }), 1]);

        expect(len).toEqual(actualVecBytesLen);
    });

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1387
    it('vec of string encoded as expected', () => {
        const strings = ['Hamlet', 'Война и мир', '三国演义', 'أَلْف لَيْلَة وَلَيْلَة‎'];
        const hex = `\
10 18 48 61 6d 6c 65 74 50 d0 92 d0 be d0 b9 d0 bd d0 b0 20 d0 \
b8 20 d0 bc d0 b8 d1 80 30 e4 b8 89 e5 9b bd e6 bc 94 e4 b9 89 bc d8 a3 d9 8e d9 84 d9 92 \
d9 81 20 d9 84 d9 8e d9 8a d9 92 d9 84 d9 8e d8 a9 20 d9 88 d9 8e d9 84 d9 8e d9 8a d9 92 \
d9 84 d9 8e d8 a9 e2 80 8e`;

        const encode = (v: string) => encodeStrCompact(v);
        const decode = (b: Uint8Array) => decodeStrCompact(b);

        const encoded = encodeArrayContainer(strings, encode);
        expect(hexifyBytes(encoded)).toEqual(hex);

        const [decoded, len] = decodeArrayContainer(encoded, decode);
        expect(decoded).toEqual(strings);
        expect(len).toEqual(encoded.length);
    });
});
