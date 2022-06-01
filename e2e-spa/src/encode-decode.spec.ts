import { expect, test } from 'vitest'
import { Enum, Result } from '@scale-codec/definition-runtime'
import { encodeAndDecodeReallyComplexData } from './encode-decode'

test('it is ok', () => {
  const result = encodeAndDecodeReallyComplexData()
  const expected: Result<null, Error> = Enum.variant('Ok', null)

  expect(result).toEqual(expected)
})
