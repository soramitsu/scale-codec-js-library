import { decodeStr, encodeStr, encodeStrRaw, decodeStrRaw } from '../str';

const RUSS_HELLO = new Uint8Array([
    208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130, 44, 32, 208, 188, 208, 184, 209, 128, 33,
]);

describe('decodeStr', (): void => {
    it('decodes to an empty string for empty buffer', (): void => {
        expect(decodeStrRaw(new Uint8Array())).toEqual('');
    });

    it('decodes the buffer correctly', (): void => {
        expect(decodeStrRaw(RUSS_HELLO)).toEqual('Привет, мир!');
    });

    it('fails on invalid utf8', () => {
        // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1634
        expect(() => decodeStrRaw(Uint8Array.from([20, 114, 167, 10, 20, 114]))).toThrow();
    });
});

describe('encodeStr', (): void => {
    it('encodes the string correctly', (): void => {
        expect(encodeStrRaw('Привет, мир!')).toEqual(RUSS_HELLO);
    });

    it('encodes the string correctly (String)', (): void => {
        expect(encodeStrRaw(String('Привет, мир!'))).toEqual(RUSS_HELLO);
    });
});

describe('encodeStrCompact', () => {
    it.each([{ text: 'foo', expected: new Uint8Array([12, 102, 111, 111]) }])(
        'can encode $foo',
        ({ text, expected }) => {
            expect(encodeStr(text)).toEqual(expected);
        },
    );
});

describe('decodeStrCompact', () => {
    it.each([{ bytes: Uint8Array.from([12, 102, 111, 111]), expected: 'foo' }])(
        'can decode to $expected',
        ({ bytes, expected }) => {
            const [str] = decodeStr(bytes);

            expect(str).toEqual(expected);
        },
    );

    it('correct decoded length for ASCII', () => {
        const TEXT = 'abcde';
        const encoded = encodeStr(TEXT);

        const [_str, len] = decodeStr(encoded);

        expect(len).toBe(6);
    });

    it('correct decoded length for non-ASCII', () => {
        const TEXT = '中文';
        const encoded = encodeStr(TEXT);

        const [_str, len] = decodeStr(encoded);

        expect(len).toBe(7);
    });
});
