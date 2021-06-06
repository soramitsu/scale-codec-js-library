import JSBI from 'jsbi';
import { decodeBigInt, encodeBigInt } from './int';
import { decodeArrayContainer, decodeTuple, encodeArrayContainer, encodeTuple } from './containers';
import { decodeStrCompact, encodeStrCompact } from './str';
import { decodeBool, encodeBool } from './bool';
import { yieldNTimes } from '@scale-codec/util';

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

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1336
    it.todo('vec of option int encoded as expected');

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1344
    it.todo('vec of option bool encoded as expected');
});

describe('Tuple', () => {
    it('tuple () encoded as expected', () => {
        const encoded = encodeTuple([], []);

        expect(encoded).toEqual(new Uint8Array());

        expect(decodeTuple(encoded, [])).toEqual([[], 0]);
    });

    it('tuple (u64, String, Vec<i8>, (i32, i32), bool) encoded as expected', () => {
        type Codec<T> = [(v: T) => Uint8Array, (b: Uint8Array) => [T, number]];

        const strCodec: Codec<string> = [encodeStrCompact, decodeStrCompact];
        const i32Codec: Codec<JSBI> = [
            (n) => encodeBigInt(n, { bits: 32, isSigned: true }),
            (b) => [decodeBigInt(b, { bits: 32, isSigned: true }), 4],
        ];
        const i8Codec: Codec<JSBI> = [
            (n) => encodeBigInt(n, { bits: 8, isSigned: true }),
            (b) => [decodeBigInt(b, { bits: 8, isSigned: true }), 1],
        ];
        const u64Codec: Codec<JSBI> = [(n) => encodeBigInt(n, { bits: 64 }), (b) => [decodeBigInt(b, { bits: 64 }), 8]];
        const veci8Codec: Codec<JSBI[]> = [
            (arr) => encodeArrayContainer(arr, i8Codec[0]),
            (b) => decodeArrayContainer(b, i8Codec[1]),
        ];
        const boolCodec: Codec<boolean> = [encodeBool, (b) => [decodeBool(b), 1]];
        const i32TupleCodec: Codec<[JSBI, JSBI]> = [
            (v) => encodeTuple(v, yieldNTimes(i32Codec[0], 2)),
            (b) => decodeTuple(b, yieldNTimes(i32Codec[1], 2)),
        ];

        const TUPLE_CODECS = [u64Codec, strCodec, veci8Codec, i32TupleCodec, boolCodec];

        const ENCODED = Uint8Array.from([
            64, 0, 0, 0, 0, 0, 0, 0, 24, 72, 101, 110, 110, 111, 63, 20, 7, 1, 22, 5, 214, 110, 239, 255, 255, 16, 248,
            6, 0, 1,
        ]);

        const VALUE = [
            JSBI.BigInt(64),
            'Henno?',
            [7, 1, 22, 5, -42].map(JSBI.BigInt),
            [-4242, 456720].map(JSBI.BigInt),
            true,
        ];

        expect(encodeTuple(VALUE, TUPLE_CODECS.map((x) => x[0]) as any)).toEqual(ENCODED);
        expect(decodeTuple(ENCODED, TUPLE_CODECS.map((x) => x[1]) as any)).toEqual([VALUE, ENCODED.length]);
    });
});
