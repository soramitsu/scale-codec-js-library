import { fromHex } from '@scale-codec/util'
import ENCODE_TEST_DATA from '../../../rust-samples/output-ints.json'
import { WalkerImpl as Walker } from '../util'
import {
  BigIntTypes,
  IntTypes,
  createBigIntDecoder,
  createBigIntEncoder,
  createIntDecoder,
  createIntEncoder,
  encodeBigInt,
  encodeInt,
} from './int'
import { ensureDecodeImmutability } from './__tests__/util'

describe('Ints (8-32 bits)', () => {
  describe("Rust's samples", () => {
    const filtered = ENCODE_TEST_DATA.filter((x) => x.bits <= 32)

    test.each(filtered)('Encode/decode $decimal (signed=$signed, bits=$bits)', ({ decimal, le, signed, bits }) => {
      const encoded = fromHex(le)
      const ty: IntTypes = `${signed ? 'i' : 'u'}${bits}` as any
      const num = Number(decimal)

      expect(Walker.encode(num, createIntEncoder(ty))).toEqual(encoded)
      expect(Walker.decode(encoded, createIntDecoder(ty))).toEqual(num)
    })
  })

  test('Decode of subarray works (shared ArrayBuffer)', () => {
    const bytes = new Uint8Array([8, 1, 4, 1, ...Walker.encode(55122, createIntEncoder('u32')), 123, 4, 1, 2, 61])
    const bytesSub = bytes.subarray(4, 8)

    expect(Walker.decode(bytesSub, createIntDecoder('u32'))).toEqual(55122)
  })

  test('Decode is immutable', () => {
    ensureDecodeImmutability(Walker.encode(1882834, createIntEncoder('u32')), createIntDecoder('u32'))
  })

  test('Unsigned encoder throws if negative num is passed', () => {
    expect(() => encodeInt(-1, 'u16', new Walker(new Uint8Array(20)))).toThrow()
  })

  test('Encoder throws if non-integer num is passed', () => {
    expect(() => encodeInt(3.14, 'i32', new Walker(new Uint8Array(20)))).toThrow()
  })

  test('Encoder throws if non-safe integer num is passed', () => {
    expect(() => encodeInt(1e20, 'u32', new Walker(new Uint8Array(20)))).toThrow()
  })
})

describe('Big ints (64-128 bits)', () => {
  describe("Rust's samples", () => {
    test.each(ENCODE_TEST_DATA)(
      'Encode/decode $decimal (signed=$signed, bits=$bits)',
      ({ decimal, le, signed, bits }) => {
        const encoded = fromHex(le)
        const ty: BigIntTypes = `${signed ? 'i' : 'u'}${bits}` as any
        const num = BigInt(decimal)

        expect(Walker.encode(num, createBigIntEncoder(ty))).toEqual(encoded)
        expect(Walker.decode(encoded, createBigIntDecoder(ty))).toEqual(num)
      },
    )
  })

  test('Decode of subarray works (shared ArrayBuffer)', () => {
    const bytes = new Uint8Array([8, 1, 4, 1, ...Walker.encode(-55122n, createBigIntEncoder('i128'))])
    const bytesSub = bytes.subarray(4, 20)

    expect(Walker.decode(bytesSub, createBigIntDecoder('i128'))).toEqual(-55122n)
  })

  test('Decode is immutable', () => {
    ensureDecodeImmutability(Walker.encode(1882834n, createBigIntEncoder('i64')), createBigIntDecoder('i64'))
  })

  test.each([['u32'], ['u64'], ['u128']])(
    'Unsigned encoder (%p) throws if a negative bigint is passed',
    (encoding: BigIntTypes) => {
      expect(() => encodeBigInt(-1n, encoding, new Walker(new Uint8Array(20)))).toThrowError(
        /Negative num \(-1n?\) is passed/,
      )
    },
  )
})
