import { A_encode, B_encode, C_decode, C_Decoded } from '../samples/aliases';
import { str_encode, JSBI, encodeTuple, u8_encode } from '@scale-codec/definition-runtime';

test('B str alias encodes OK', () => {
    const str = 'Koora';
    expect(str_encode(str)).toEqual(B_encode(str));
});

test('A alias for B (str alias) encodes OK', () => {
    const str = 'Torii';
    expect(str_encode(str)).toEqual(A_encode(str));
});

test('C (tuple with inner alias) decodes ok', () => {
    const tuple: C_Decoded = ['Gofria', JSBI.BigInt(124)];
    const encoded = encodeTuple(tuple, [str_encode, u8_encode]);

    expect(C_decode(encoded)).toEqual([tuple, encoded.length]);
});
