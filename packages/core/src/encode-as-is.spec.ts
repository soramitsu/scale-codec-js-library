import { isEncodeAsIsWrapper, encodeAsIs, respectEncodeAsIs, makeEncoderAsIsRespectable } from './encode-as-is';

test('Mark check works', () => {
    expect(isEncodeAsIsWrapper(encodeAsIs(new Uint8Array([1, 5, 1, 2])))).toBe(true);
});

describe('respectEncodeAsIs()', () => {
    test('Returns source fn return if the value was not marked', () => {
        expect(respectEncodeAsIs('some value', () => new Uint8Array([4, 1, 2]))).toEqual(new Uint8Array([4, 1, 2]));
    });

    test('Returns wrapped bytes if the value was wrapped', () => {
        expect(respectEncodeAsIs(encodeAsIs(new Uint8Array([5, 3, 1])), () => new Uint8Array([4, 1, 2]))).toEqual(
            new Uint8Array([5, 3, 1]),
        );
    });
});

describe('makeEncoderAsIsRespectable()', () => {
    test('Returned wrapper uses source encoder for default values', () => {
        const encode = (val: boolean) => new Uint8Array([1, 2, 3]);

        const wrapped = makeEncoderAsIsRespectable(encode);

        expect(wrapped(false)).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('Returned wrapper returns wrapped bytes', () => {
        const encode = (val: boolean) => new Uint8Array([1, 2, 3]);
        const bytes = new Uint8Array([4, 5, 6]);

        const wrapped = makeEncoderAsIsRespectable(encode);

        expect(wrapped(encodeAsIs(bytes))).toEqual(new Uint8Array([4, 5, 6]));
    });
});
