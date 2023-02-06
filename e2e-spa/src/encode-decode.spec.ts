import { expect, test } from 'vitest'
import { RustResult, variant } from '@scale-codec/definition-runtime'
import { encodeAndDecodeReallyComplexData } from './encode-decode'

test('it is ok', () => {
  const result = encodeAndDecodeReallyComplexData()
  const expected: RustResult<null, Error> = variant('Ok', null)

  expect(result).toEqual(expected)
})
