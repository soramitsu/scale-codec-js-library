import { decodeStr, encodeStr } from './str';

const RUSS_HELLO = new Uint8Array([
    208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130, 44, 32, 208, 188, 208, 184, 209, 128, 33,
]);

describe('decodeStr', (): void => {
    it('decodes to an empty string for empty buffer', (): void => {
        expect(decodeStr(new Uint8Array())).toEqual('');
    });

    it('decodes the buffer correctly', (): void => {
        expect(decodeStr(RUSS_HELLO)).toEqual('Привет, мир!');
    });
});

describe('encodeStr', (): void => {
    it('encodes the string correctly', (): void => {
        expect(encodeStr('Привет, мир!')).toEqual(RUSS_HELLO);
    });

    it('encodes the string correctly (String)', (): void => {
        expect(encodeStr(String('Привет, мир!'))).toEqual(RUSS_HELLO);
    });
});
