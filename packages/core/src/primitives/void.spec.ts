import { encodeVoid, decodeVoid } from './void';

test('Encodes into empty bytes', () => {
    expect(encodeVoid()).toEqual(new Uint8Array());
});

test('Decodes into null result', () => {
    expect(decodeVoid(new Uint8Array([5, 1, 2, 3, 41]))).toEqual([null, 0]);
});
