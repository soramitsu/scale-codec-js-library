import { A, B, C } from '../samples/aliases'
import { encodeStr, U8, WalkerImpl } from '@scale-codec/definition-runtime'

test('A->B alias encodes as B', () => {
    const str = 'Koora'
    expect(A.fromValue(str).bytes).toEqual(B.fromValue(str).bytes)
})

test('B->Str alias encodes as standalone string', () => {
    const str = 'Torii'
    expect(WalkerImpl.encode(str, encodeStr)).toEqual(B.fromValue(str).bytes)
})

test('C (tuple with inner alias) decodes ok', () => {
    const tuple = C.fromValue([B.fromValue('Hey'), U8.fromValue(123)])

    const encoded = tuple.bytes
    const [{ value: str }, { value: num }] = C.fromBuffer(encoded).value

    expect(str).toEqual('Hey')
    expect(num).toEqual(123)
})
