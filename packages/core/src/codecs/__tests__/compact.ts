/* eslint-disable max-nested-callbacks */
import { encodeCompact, decodeCompact } from '../compact'
import COMPACTS from '../../../../rust-ints/output-compacts.json'
import { prettyHexToBytes } from '@scale-codec/util'

describe('Rust samples', () => {
    test.each(COMPACTS)('Encode/decode $num', ({ num, hex }) => {
        const encoded = prettyHexToBytes(hex)
        const bi = BigInt(num)

        expect(encodeCompact(bi)).toEqual(encoded)
        expect(decodeCompact(encoded)).toEqual([bi, encoded.length])
    })
})

describe('encode: from Rust tests', (): void => {
    it.each([
        // Copied from https://github.com/paritytech/parity-codec/blob/master/src/codec.rs
        { expected: '00', value: BigInt('0') },
        { expected: 'fc', value: BigInt('63') },
        { expected: '01 01', value: BigInt('64') },
        { expected: 'fd ff', value: BigInt('16383') },
        { expected: '02 00 01 00', value: BigInt('16384') },
        { expected: 'fe ff ff ff', value: BigInt('1073741823') },
        { expected: '03 00 00 00 40', value: BigInt('1073741824') },
        {
            expected: '03 ff ff ff ff',
            value: BigInt(`0b${1}${'0'.repeat(32)}`) - 1n,
        },
        { expected: '07 00 00 00 00 01', value: BigInt(`0b${1}${'0'.repeat(32)}`) },
        { expected: '0b 00 00 00 00 00 01', value: BigInt(`0b${1}${'0'.repeat(40)}`) },
        { expected: '0f 00 00 00 00 00 00 01', value: BigInt(`0b${1}${'0'.repeat(48)}`) },
        {
            expected: '0f ff ff ff ff ff ff ff',
            value: BigInt(`0b${1}${'0'.repeat(56)}`) - 1n,
        },
        { expected: '13 00 00 00 00 00 00 00 01', value: BigInt(`0b${1}${'0'.repeat(56)}`) },
        {
            expected: '13 ff ff ff ff ff ff ff ff',
            value: BigInt(`0b${1}${'0'.repeat(64)}`) - 1n,
        },
    ])('encodes $value', ({ expected, value }) => {
        expect(encodeCompact(value)).toEqual(Uint8Array.from(expected.split(' ').map((s) => parseInt(s, 16))))
    })
})
