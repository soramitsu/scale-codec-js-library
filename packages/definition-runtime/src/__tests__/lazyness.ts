/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
    createTupleDecoder,
    createTupleEncoder,
    Decode,
    decodeBool,
    Encode,
    encodeBool,
    encodeFactory,
} from '@scale-codec/core'
import { encodeAnyFragment } from '../builder-creators'
import { createBuilder, Fragment, FragmentBuilder } from '../fragment'

describe('Within TupleBool', () => {
    type TupleBoolTy = [Fragment<boolean>]

    function encodeMock<T extends Encode<any>>(fn: T): T {
        return encodeFactory(jest.fn(fn.bind({})), jest.fn(fn.sizeHint.bind({}))) as any
    }

    /**
     * Returns spies for underlying codecs & builders for `bool` & `(bool)` (tuple with a single bool) types.
     */
    function prepare(): [
        FragmentBuilder<boolean>,
        FragmentBuilder<TupleBoolTy>,
        Encode<boolean>,
        Decode<boolean>,
        Encode<TupleBoolTy>,
        Decode<TupleBoolTy>,
    ] {
        const encodeBoolSpy = encodeMock(encodeBool)
        const decodeBoolSpy = jest.fn(decodeBool)

        const Bool = createBuilder<boolean, boolean>('Bool', encodeBoolSpy, decodeBoolSpy)

        const encodeTupleSpy = encodeMock(createTupleEncoder<TupleBoolTy>([encodeAnyFragment]))
        const decodeTupleSpy = jest.fn(createTupleDecoder<TupleBoolTy>([(w) => Bool.decode(w)]))

        const TupleBool = createBuilder<[Fragment<boolean>]>('TupleBool', encodeTupleSpy, decodeTupleSpy)

        return [Bool, TupleBool, encodeBoolSpy, decodeBoolSpy, encodeTupleSpy, decodeTupleSpy]
    }

    describe('Constructing a small nested structure of fragments', () => {
        test('When it is created, codecs are not called', () => {
            const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare()
            const tup = TupleBool.fromValue([Bool.fromValue(false)])

            expect(tup.value[0].value).toEqual(false)
            expect(encodeBool).not.toHaveBeenCalled()
            expect(encodeBool.sizeHint).not.toHaveBeenCalled()
            expect(encodeTuple).not.toHaveBeenCalled()
            expect(encodeTuple.sizeHint).not.toHaveBeenCalled()
        })

        test('When bytes of inner fragment are got, only bool codec is called', () => {
            const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare()
            const tup = TupleBool.fromValue([Bool.fromValue(false)])

            tup.value[0].bytes

            expect(encodeBool).toHaveBeenCalledTimes(1)
            expect(encodeBool.sizeHint).toHaveBeenCalledTimes(1)
            expect(encodeTuple).not.toHaveBeenCalled()
            expect(encodeTuple.sizeHint).not.toHaveBeenCalled()
        })

        test('When bytes of outer fragment are got, both codecs are called', () => {
            const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare()
            const tup = TupleBool.fromValue([Bool.fromValue(false)])

            tup.bytes

            expect(encodeBool).toHaveBeenCalledTimes(1)
            expect(encodeBool.sizeHint).toHaveBeenCalledTimes(1)
            expect(encodeTuple).toHaveBeenCalledTimes(1)
            expect(encodeTuple.sizeHint).toHaveBeenCalledTimes(1)
        })

        test('When bytes of outer fragment are got, but after getting of bytes of inner fragments, inner-fragment codecs are not re-called', () => {
            const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare()
            const tup = TupleBool.fromValue([Bool.fromValue(false)])

            tup.value[0].bytes
            tup.bytes

            expect(encodeBool).toHaveBeenCalledTimes(1)
            expect(encodeBool.sizeHint).toHaveBeenCalledTimes(1)
            expect(encodeTuple).toHaveBeenCalledTimes(1)
            expect(encodeTuple.sizeHint).toHaveBeenCalledTimes(1)
        })
    })
})
