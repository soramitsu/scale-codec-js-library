import { describe, expect, test } from 'vitest'
import { decodeU8, encodeU8 } from './int'
import { WalkerImpl } from '../util'
import { createArrayDecoder, createArrayEncoder, createUint8ArrayDecoder, createUint8ArrayEncoder } from './array'
import { ensureDecodeImmutability } from './__tests__/util'

describe.concurrent('Array codec', () => {
  describe('[T; x]', () => {
    describe('[u8; 7]', () => {
      const nums = [5, 8, 1, 2, 8, 42, 129]
      const encoded = Uint8Array.from(nums)

      test('encode', () => {
        expect(WalkerImpl.encode(nums, createArrayEncoder(encodeU8, nums.length))).toEqual(encoded)
      })

      test('decode', () => {
        expect(WalkerImpl.decode(encoded, createArrayDecoder(decodeU8, nums.length))).toEqual(nums)
      })

      test('decode is immutable', () => {
        ensureDecodeImmutability(encoded, createArrayDecoder(decodeU8, nums.length))
      })
    })

    test('When array with invalid length is passed, encode throws', () => {
      expect(() => WalkerImpl.encode([1, 2, 3], createArrayEncoder(encodeU8, 5))).toThrowError(
        /\[T; 3\] is passed to \[T; 5\] encoder/,
      )
    })
  })

  describe('[u8; x]', () => {
    test('When encodes, just writes the same bytes', () => {
      // Arrange
      const LEN = 7
      const INPUT = new Uint8Array([1, 5, 4, 1, 2, 6, 1])
      const walker = new WalkerImpl(new Uint8Array(10))

      // Act
      createUint8ArrayEncoder(LEN)(INPUT, walker)

      // Assert
      expect(walker.u8).toEqual(new Uint8Array([1, 5, 4, 1, 2, 6, 1, 0, 0, 0]))
      expect(walker.idx).toEqual(LEN)
    })

    test('Mutation on encoded does not affect the source', () => {
      // Arrange
      const source = new Uint8Array([0, 0, 0, 0, 0])

      // Act
      const encoded = WalkerImpl.encode(source.subarray(3), createUint8ArrayEncoder(2))
      encoded[0] = 1

      // Assert
      expect(source).toEqual(new Uint8Array([0, 0, 0, 0, 0]))
    })

    test('Encoding throws if bytes length is not correct', () => {
      expect(() => WalkerImpl.encode(new Uint8Array([5, 1, 2]), createUint8ArrayEncoder(1))).toThrowError(
        /\[u8; 3\] is passed to \[u8; 1\] encoder/,
      )
    })

    test('Returns part of the source bytes on decode', () => {
      // Arrange
      const SOURCE = new Uint8Array([65, 12, 43, 12, 43])
      const ARRAY_LEN = 3
      const walker = new WalkerImpl(SOURCE)
      walker.idx += 1

      // Act
      const decoded = createUint8ArrayDecoder(ARRAY_LEN)(walker)

      // Assert
      expect(decoded).toEqual(new Uint8Array([12, 43, 12]))
      expect(walker.idx).toEqual(4)
    })

    test('Mutation of decoded part does not affect the source', () => {
      ensureDecodeImmutability(new Uint8Array(10), createUint8ArrayDecoder(10))
    })

    test('Decoding throws if the source bytes length less than the array length', () => {
      expect(() => WalkerImpl.decode(new Uint8Array(), createUint8ArrayDecoder(3))).toThrowError(
        /\[u8; 0\] is passed to \[u8; 3\] decoder \(len should be >= 3\)/,
      )
    })
  })
})
