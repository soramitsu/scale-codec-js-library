import { A, B, C } from '../samples/aliases';
import { encodeStrCompact, encodeTuple, InnerValue, JSBI, U8 } from '@scale-codec/definition-runtime';

test('A->B alias encodes as B', () => {
    const str = 'Koora';
    expect(A.fromValue(str).bytes).toEqual(B.fromValue(str).bytes);
});

test('B->Str alias encodes as standalone string', () => {
    const str = 'Torii';
    expect(encodeStrCompact(str)).toEqual(B.fromValue(str).bytes);
});

test('C (tuple with inner alias) decodes ok', () => {
    const tuple = C.fromValue([B.fromValue('Hey'), U8.fromValue(JSBI.BigInt(123))]);

    const encoded = tuple.bytes;
    const [{ value: str }, { value: num }] = C.fromBytes(encoded).value;

    expect(str).toEqual('Hey');
    expect(num).toEqual(JSBI.BigInt(123));
});
