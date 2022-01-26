import { WalkerImpl as Walker } from './util'
import { hexifyBytes } from '@scale-codec/util'
import { Decode, Encode } from './types'

describe('Walker', () => {
    it('When source is not a subarray, writing works', () => {
        const walker = new Walker(new Uint8Array(4).fill(0))

        walker.arr[3] = 5

        expect(hexifyBytes(walker.arr)).toEqual('00 00 00 05')
    })

    it('When source is a subarray, writing works', () => {
        const source = new Uint8Array([0xca, 0xfe, 0xba, 0xbe, 0x12, 0x34, 0x56, 0x78])
        const sub = source.subarray(2, 6)
        const walker = new Walker(sub)

        walker.arr[0] = 0xff

        expect(hexifyBytes(sub)).toEqual('ff be 12 34')
    })

    it('When source is subarray, DataView setting/getting works correct', () => {
        const source = new Uint8Array([0xca, 0xfe, 0xba, 0xbe, 0x12, 0x34, 0x56, 0x78])
        const sub = source.subarray(2, 6)
        const walker = new Walker(sub)

        expect(walker.view.getUint8(2)).toEqual(sub[2])

        walker.view.setUint8(3, 0xff)

        expect(hexifyBytes(sub)).toEqual('ba be 12 ff')
    })

    describe('static encode()', () => {
        it('When encode is done correctly, returns correct bytes', () => {
            const VALUE = 'hello'
            const ENCODE: Encode<string> = (str, walker) => {
                walker.arr.set([5, 1, 2, 3, 4])
                walker.offset += 5
            }
            ENCODE.sizeHint = () => 5

            const result = Walker.encode(VALUE, ENCODE)

            expect(hexifyBytes(result)).toEqual('05 01 02 03 04')
        })

        it('When allocated array size does not match to actual used bytes, throws', () => {
            const VALUE = 0
            const ENCODE: Encode<number> = (str, walker) => {
                walker.offset += 3
            }
            ENCODE.sizeHint = () => 5

            expect(() => Walker.encode(VALUE, ENCODE)).toThrowError(
                /offset \(3\) is not equal to array bytes length \(5\)/,
            )
        })
    })

    describe('static decode()', () => {
        it('When decode is done correctly, returns decoded value', () => {
            const INPUT = new Uint8Array([1, 2, 3])
            const DECODE: Decode<number> = (walker) => {
                walker.offset += 3
                return 7
            }

            const result = Walker.decode(INPUT, DECODE)

            expect(result).toEqual(7)
        })

        it('When decoded bytes count is not equal to input length, throws', () => {
            const INPUT = new Uint8Array(10)
            const DECODE: Decode<number> = (walker) => {
                walker.offset += 1
                return 7
            }

            expect(() => Walker.decode(INPUT, DECODE)).toThrowError(
                /offset \(1\) is not equal to array bytes length \(10\)/,
            )
        })
    })
})
