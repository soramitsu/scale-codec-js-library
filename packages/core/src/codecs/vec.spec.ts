import { toHex, fromHex } from '@scale-codec/util'
import { Enum, Option } from '@scale-codec/enum'
import { WalkerImpl } from '../util'
import { encodeUint8Vec, decodeUint8Vec, createVecDecoder, createVecEncoder } from './vec'
import { createBigIntDecoder, createBigIntEncoder, createIntDecoder, createIntEncoder } from './int'
import { encodeStr, decodeStr } from './str'

describe('Vec<T>', () => {
    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1320
    it('vec of u8 encoded as expected', () => {
        const numbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34].map((x) => BigInt(x))
        const hex = '28 00 01 01 02 03 05 08 0d 15 22'

        const encoded = WalkerImpl.encode(numbers, createVecEncoder(createBigIntEncoder('u8')))

        expect(toHex(encoded)).toEqual(hex)

        const decoded = WalkerImpl.decode(encoded, createVecDecoder(createBigIntDecoder('u8')))

        expect(decoded).toEqual(numbers)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1328
    it('vec of i16 encoded as expected', () => {
        const numbers = [0, 1, -1, 2, -2, 3, -3]
        const hex = '1c 00 00 01 00 ff ff 02 00 fe ff 03 00 fd ff'

        const encoded = WalkerImpl.encode(numbers, createVecEncoder(createIntEncoder('i16')))

        expect(toHex(encoded)).toEqual(hex)

        const decoded = WalkerImpl.decode(encoded, createVecDecoder(createIntDecoder('i16')))

        expect(decoded).toEqual(numbers)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1387
    it('vec of string encoded as expected', () => {
        const strings = ['Hamlet', 'Война и мир', '三国演义', 'أَلْف لَيْلَة وَلَيْلَة‎']
        const hex =
            `10 18 48 61 6d 6c 65 74 50 d0 92 d0 be d0 b9 d0 bd d0 b0 20 d0 ` +
            `b8 20 d0 bc d0 b8 d1 80 30 e4 b8 89 e5 9b bd e6 bc 94 e4 b9 89 bc d8 a3 d9 8e d9 84 d9 92 ` +
            `d9 81 20 d9 84 d9 8e d9 8a d9 92 d9 84 d9 8e d8 a9 20 d9 88 d9 8e d9 84 d9 8e d9 8a d9 92 ` +
            `d9 84 d9 8e d8 a9 e2 80 8e`

        const encoded = WalkerImpl.encode(strings, createVecEncoder(encodeStr))

        expect(toHex(encoded)).toEqual(hex)

        const decoded = WalkerImpl.decode(encoded, createVecDecoder(decodeStr))

        expect(decoded).toEqual(strings)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1336
    it.todo(
        'vec of option int encoded as expected',
        // () => {
        //     const codec = optionCodec<bigint>(bigIntCodec('i8'))
        //     const vec: Enum<OptionDef<bigint>>[] = [
        //         Enum.valuable('Some', 1n),
        //         Enum.valuable('Some', -1n),
        //         Enum.empty('None'),
        //     ]
        //     const hex = '0c 01 01 01 ff 00'

        //     it('encode', () => {
        //         expect(toHex(concatBytes(encodeVec(vec, codec.encode)))).toEqual(hex)
        //     })

        //     it('decode', () => {
        //         expect(decodeVec(fromHex(hex), codec.decode)).toEqual([vec, 6])
        //     })
        // }
    )

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1344
    // it is a special type, OptionBool. see related Rust's source code
    // it encodes not like default enum
    it.todo(
        'vec of option bool encoded as expected',
        // () => {
        //     const vec: Option<boolean>[] = [Enum.valuable('Some', true), Enum.valuable('Some', false), Enum.empty('None')]
        //     const hex = '0c 01 02 00'

        //     it('encode', () => {
        //         expect(
        //             concatBytes(
        //                 encodeVec(vec, function* (item) {
        //                     yield new Uint8Array([
        //                         item.match({
        //                             None: () => 0,
        //                             Some: (val) => (val ? 1 : 2),
        //                         }),
        //                     ])
        //                 }),
        //             ),
        //         ).toEqual(fromHex(hex))
        //     })

        //     it('decode', () => {
        //         expect(
        //             decodeVec(fromHex(hex), (bytes): DecodeResult<Enum<OptionDef<boolean>>> => {
        //                 switch (bytes[0]) {
        //                     case 0:
        //                         return [Enum.empty('None'), 1]
        //                     case 1:
        //                         return [Enum.valuable('Some', true), 1]
        //                     case 2:
        //                         return [Enum.valuable('Some', false), 1]
        //                     default:
        //                         throw new Error('unreachable?')
        //                 }
        //             }),
        //         ).toEqual([vec, 4])
        //     })
        // }
    )
})

describe('Vec<u8>', () => {
    const vec = [5, 1, 2, 61, 255]
    const vecEncoded = [20, 5, 1, 2, 61, 255]

    test('Encodes ok', () => {
        expect(WalkerImpl.encode(new Uint8Array(vec), encodeUint8Vec)).toEqual(new Uint8Array(vecEncoded))
    })

    test('Decodes ok', () => {
        expect(WalkerImpl.decode(new Uint8Array(vecEncoded), decodeUint8Vec)).toEqual(new Uint8Array(vec))
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
