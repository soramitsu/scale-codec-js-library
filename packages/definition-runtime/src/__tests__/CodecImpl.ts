import { Decode, decodeBool, encodeBool, Walker } from '@scale-codec/core'
import { CodecImpl, Fragment } from '../core'
import { CodecTracker, setCurrentTracker } from '../tracking'

test('When constructing a value from a buffer, it works', () => {
    const INPUT = new Uint8Array([1])
    const EXPECTED_VALUE = true

    const codec = new CodecImpl('bool', encodeBool, decodeBool)
    const value = codec.fromBuffer(INPUT)

    expect(value).toEqual(EXPECTED_VALUE)
})

test('When constructing a buffer from a value, it works', () => {
    const EXPECTED_OUTPUT = new Uint8Array([0])
    const VALUE = false

    const codec = new CodecImpl('bool', encodeBool, decodeBool)
    const output = codec.toBuffer(VALUE)

    expect(output).toEqual(EXPECTED_OUTPUT)
})

test("When constructing value from a fragment, a fragment's copy is just returned", () => {
    const BUFF = new Uint8Array([1, 2, 3, 4])
    const FRAGMENT = new Fragment(BUFF)

    const codec = new CodecImpl('bool', encodeBool, decodeBool)
    const buffer = codec.toBuffer(FRAGMENT)

    expect(buffer).toEqual(BUFF)

    // assert that it is a copy
    buffer[0] = 99

    expect(BUFF[0]).toEqual(1)
})

describe('When it is being tracked', () => {
    // class TestTracker implements CodecTracker {

    //     public decode<T>(loc: string, walker: Walker, decode: Decode<T>): T {
    //         return
    //     }
    // }

    let tracker: CodecTracker

    beforeEach(() => {
        tracker = {
            decode: jest
                .fn()
                .mockImplementation(<T>(loc: string, walker: Walker, decode: Decode<T>): T => decode(walker)),
        }

        setCurrentTracker(tracker)
    })

    afterEach(() => {
        setCurrentTracker(null)
    })

    test('Then decode is tracked', () => {
        const codec = new CodecImpl('TEST', encodeBool, decodeBool)

        codec.fromBuffer(new Uint8Array([5]))

        expect(tracker.decode).toBeCalledTimes(1)
        expect((tracker.decode as jest.Mock).mock.calls[0][0]).toEqual('TEST')
    })
})
