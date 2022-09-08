import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Decode, Walker, decodeBool, encodeBool } from '@scale-codec/core'
import { trackableCodec } from '../core'
import { CodecTracker, setCurrentTracker } from '../tracking'

describe.concurrent('Trackable codec', () => {
  test('When constructing a value from a buffer, it works', () => {
    const INPUT = new Uint8Array([1])
    const EXPECTED_VALUE = true

    const codec = trackableCodec('bool', encodeBool, decodeBool)
    const value = codec.fromBuffer(INPUT)

    expect(value).toEqual(EXPECTED_VALUE)
  })

  test('When constructing a buffer from a value, it works', () => {
    const EXPECTED_OUTPUT = new Uint8Array([0])
    const VALUE = false

    const codec = trackableCodec('bool', encodeBool, decodeBool)
    const output = codec.toBuffer(VALUE)

    expect(output).toEqual(EXPECTED_OUTPUT)
  })

  describe('When it is being tracked', () => {
    let tracker: CodecTracker

    beforeEach(() => {
      tracker = {
        decode: vi.fn().mockImplementation(<T>(loc: string, walker: Walker, decode: Decode<T>): T => decode(walker)),
      }

      setCurrentTracker(tracker)
    })

    afterEach(() => {
      setCurrentTracker(null)
    })

    test('Then decode is tracked', () => {
      const codec = trackableCodec('TEST', encodeBool, decodeBool)

      codec.fromBuffer(new Uint8Array([5]))

      expect(tracker.decode).toBeCalledTimes(1)
      expect((tracker.decode as Mock).mock.calls[0][0]).toEqual('TEST')
    })
  })
})
