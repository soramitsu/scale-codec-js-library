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
import { Enumerate, RustOption, variant } from '@scale-codec/enum'
import { Decode, Encode } from '../types'

describe.concurrent('Enum codec', () => {
  describe('Option<bool>', () => {
    function createEncoder(): Encode<RustOption<boolean>> {
      return createOptionEncoder(encodeBool)
    }

    function createDecoder(): Decode<RustOption<boolean>> {
      return createOptionDecoder(decodeBool)
    }

    it('"None" encoded as expected', () => {
      expect(WalkerImpl.encode(variant('None'), createEncoder())).toEqual(new Uint8Array([0]))
    })

    it('"None" decoded as expected', () => {
      expect(WalkerImpl.decode(new Uint8Array([0]), createDecoder())).toEqual(variant('None'))
    })

    it('"Some(false)" encoded as expected', () => {
      expect(WalkerImpl.encode(variant('Some', true), createEncoder())).toEqual(new Uint8Array([1, 1]))
    })

    it('"Some(false)" decoded as expected', () => {
      expect(WalkerImpl.decode(new Uint8Array([1, 0]), createDecoder())).toEqual(variant('Some', false))
    })
  })

  describe('OptionBool', () => {
    function pretty(val: RustOption<boolean>): string {
      return val.tag === 'None' ? 'None' : `Some(${val.content})`
    }

    function testCase(val: RustOption<boolean>, encoded: number): [string, RustOption<boolean>, number] {
      return [pretty(val), val, encoded]
    }

    test.each([testCase(variant('None'), 0), testCase(variant('Some', true), 1), testCase(variant('Some', false), 2)])(
      'encode/decode %s',
      (_label, item, byte) => {
        const bytes = Uint8Array.from([byte])

        expect(WalkerImpl.encode(item, encodeOptionBool)).toEqual(bytes)
        expect(WalkerImpl.decode(bytes, decodeOptionBool)).toEqual(item)
      },
    )
  })

  type TestEnum = Enumerate<{ Empty: []; NonEmpty: [boolean] }>

  it('meaningfull error if trying to decode data with invalid discriminant', () => {
    expect(() =>
      WalkerImpl.decode(
        new Uint8Array([51]),
        createEnumDecoder<TestEnum>({
          0: 'Empty',
          3: ['NonEmpty', decodeBool],
        }),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Decode data for discriminant 51 is undefined; decoders schema: 0 => Empty, 3 => NonEmpty(...)"`,
    )
  })

  it('meaningfull error if trying to encode data with invalid variant name', () => {
    const value: TestEnum = variant('NonEmpty', false)

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
