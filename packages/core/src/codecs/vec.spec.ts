import { toHex, fromHex } from '@scale-codec/util'
import { Enum, Option } from '@scale-codec/enum'
import { WalkerImpl } from '../util'
import { encodeUint8Vec, decodeUint8Vec, createVecDecoder, createVecEncoder } from './vec'
import { encodeI8, decodeI8, encodeU8, decodeU8, encodeI16, decodeI16 } from './int'
import { encodeStr, decodeStr } from './str'
import { createOptionEncoder, createOptionDecoder, decodeOptionBool, encodeOptionBool } from './enum'

describe('Vec<T>', () => {
    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1320
    it('vec of u8 encoded as expected', () => {
        const VALUE = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
        const HEX = '28 00 01 01 02 03 05 08 0d 15 22'

        expect(toHex(WalkerImpl.encode(VALUE, createVecEncoder(encodeU8)))).toEqual(HEX)
        expect(WalkerImpl.decode(fromHex(HEX), createVecDecoder(decodeU8))).toEqual(VALUE)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1328
    it('vec of i16 encoded as expected', () => {
        const VALUE = [0, 1, -1, 2, -2, 3, -3]
        const HEX = '1c 00 00 01 00 ff ff 02 00 fe ff 03 00 fd ff'

        expect(toHex(WalkerImpl.encode(VALUE, createVecEncoder(encodeI16)))).toEqual(HEX)
        expect(WalkerImpl.decode(fromHex(HEX), createVecDecoder(decodeI16))).toEqual(VALUE)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1387
    it('vec of string encoded as expected', () => {
        const VALUE = ['Hamlet', 'Война и мир', '三国演义', 'أَلْف لَيْلَة وَلَيْلَة‎']
        const HEX =
            `10 18 48 61 6d 6c 65 74 50 d0 92 d0 be d0 b9 d0 bd d0 b0 20 d0 ` +
            `b8 20 d0 bc d0 b8 d1 80 30 e4 b8 89 e5 9b bd e6 bc 94 e4 b9 89 bc d8 a3 d9 8e d9 84 d9 92 ` +
            `d9 81 20 d9 84 d9 8e d9 8a d9 92 d9 84 d9 8e d8 a9 20 d9 88 d9 8e d9 84 d9 8e d9 8a d9 92 ` +
            `d9 84 d9 8e d8 a9 e2 80 8e`

        expect(toHex(WalkerImpl.encode(VALUE, createVecEncoder(encodeStr)))).toEqual(HEX)
        expect(WalkerImpl.decode(fromHex(HEX), createVecDecoder(decodeStr))).toEqual(VALUE)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1336
    it('vec of option int encoded as expected', () => {
        const VEC: Option<number>[] = [Enum.variant('Some', 1), Enum.variant('Some', -1), Enum.variant('None')]
        const HEX = '0c 01 01 01 ff 00'

        expect(toHex(WalkerImpl.encode(VEC, createVecEncoder(createOptionEncoder(encodeI8))))).toEqual(HEX)
        expect(WalkerImpl.decode(fromHex(HEX), createVecDecoder(createOptionDecoder(decodeI8)))).toEqual(VEC)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1344
    // it is a special type, OptionBool. see related Rust's source code
    // it encodes not like default enum
    it('vec of option bool encoded as expected', () => {
        const VEC: Option<boolean>[] = [Enum.variant('Some', true), Enum.variant('Some', false), Enum.variant('None')]
        const HEX = '0c 01 02 00'

        expect(toHex(WalkerImpl.encode(VEC, createVecEncoder(encodeOptionBool)))).toEqual(HEX)
        expect(WalkerImpl.decode(fromHex(HEX), createVecDecoder(decodeOptionBool))).toEqual(VEC)
    })
})

describe('Vec<u8>', () => {
    const VEC = [5, 1, 2, 61, 255]
    const ENCODED = [20, 5, 1, 2, 61, 255]

    test('Encodes ok', () => {
        expect(WalkerImpl.encode(new Uint8Array(VEC), encodeUint8Vec)).toEqual(new Uint8Array(ENCODED))
    })

    test('Decodes ok', () => {
        expect(WalkerImpl.decode(new Uint8Array(ENCODED), decodeUint8Vec)).toEqual(new Uint8Array(VEC))
    })

    test('Mutation of the source does not affect the encode result', () => {
        // Arrange
        const source = new Uint8Array([1, 2, 3, 4])

        // Act
        const encoded = WalkerImpl.encode(source.subarray(1), encodeUint8Vec)
        const encodedSaved = [...encoded]
        source[2] = 15

        // Assert
        expect(encoded).toEqual(new Uint8Array(encodedSaved))
    })

    test('Mutation of decoded bytes does not affect the source bytes', () => {
        // Arrange
        const encodedSource = new Uint8Array([16, 4, 3, 2, 1])

        // Act
        const decoded = WalkerImpl.decode(encodedSource, decodeUint8Vec)
        decoded[1] = 255

        // Assert
        expect(encodedSource).toEqual(new Uint8Array([16, 4, 3, 2, 1]))
    })
})
