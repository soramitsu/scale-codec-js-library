import { describe, expect, it, test } from 'vitest'
import {
  createEnumDecoder,
  createEnumEncoder,
  createOptionDecoder,
  createOptionEncoder,
  decodeOptionBool,
  encodeOptionBool,
} from './enum'
import { decodeBool, encodeBool } from './bool'
import { WalkerImpl } from '../util'
import { Enum, Option } from '@scale-codec/enum'
import { Decode, Encode } from '../types'

describe.concurrent('Enum codec', () => {
  describe('Option<bool>', () => {
    function createEncoder(): Encode<Option<boolean>> {
      return createOptionEncoder(encodeBool)
    }

    function createDecoder(): Decode<Option<boolean>> {
      return createOptionDecoder(decodeBool)
    }

    it('"None" encoded as expected', () => {
      expect(WalkerImpl.encode(Enum.variant('None'), createEncoder())).toEqual(new Uint8Array([0]))
    })

    it('"None" decoded as expected', () => {
      expect(WalkerImpl.decode(new Uint8Array([0]), createDecoder())).toEqual(Enum.variant('None'))
    })

    it('"Some(false)" encoded as expected', () => {
      expect(WalkerImpl.encode(Enum.variant('Some', true), createEncoder())).toEqual(new Uint8Array([1, 1]))
    })

    it('"Some(false)" decoded as expected', () => {
      expect(WalkerImpl.decode(new Uint8Array([1, 0]), createDecoder())).toEqual(Enum.variant('Some', false))
    })
  })

  describe('OptionBool', () => {
    function pretty(val: Option<boolean>): string {
      return val.match({
        None: () => 'None',
        Some: (x) => `Some(${x})`,
      })
    }

    function testCase(val: Option<boolean>, encoded: number): [string, Option<boolean>, number] {
      return [pretty(val), val, encoded]
    }

    test.each([
      testCase(Enum.variant('None'), 0),
      testCase(Enum.variant('Some', true), 1),
      testCase(Enum.variant('Some', false), 2),
    ])('encode/decode %s', (_label, item, byte) => {
      const bytes = Uint8Array.from([byte])

      expect(WalkerImpl.encode(item, encodeOptionBool)).toEqual(bytes)
      expect(WalkerImpl.decode(bytes, decodeOptionBool)).toEqual(item)
    })
  })

  it('meaningfull error if trying to decode data with invalid discriminant', () => {
    expect(() =>
      WalkerImpl.decode(
        new Uint8Array([51]),
        createEnumDecoder<Enum<'Empty' | ['Non-empty', boolean]>>({
          0: 'Empty',
          3: ['Non-empty', decodeBool],
        }),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Decode data for discriminant 51 is undefined; decoders schema: 0 => Empty, 3 => Non-empty(...)"`,
    )
  })

  it('meaningfull error if trying to encode data with invalid variant name', () => {
    type Test = Enum<'Empty' | ['NonEmpty', boolean]>

    const value: Test = Enum.variant('NonEmpty', false)

    expect(() =>
      WalkerImpl.encode(
        value,
        createEnumEncoder({
          Empty: 0,
          WrongVar: [1, encodeBool],
        } as any),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Invalid encode schema for Enum with tag \\"NonEmpty\\": undefined; encoders schema: Empty => 0, WrongVar(...) => 1"`,
    )
  })
})
