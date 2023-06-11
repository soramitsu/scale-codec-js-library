import { describe, expect, test } from 'vitest'
import { assertAllCodecsDecodeTheSame, assertAllKeysHaveTheSameValue } from '../../test/util'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecRuntime from './scale-codec-runtime'
import parity from './parity'
import { factory, nativeToPolka } from './util'

describe('Consistency', () => {
  test('Different encoders are identical', () => {
    const INPUT = factory()
    const INPUT_POLKA = nativeToPolka(INPUT)

    assertAllKeysHaveTheSameValue({
      core: scaleCodecCore.encode(INPUT),
      runtime: scaleCodecRuntime.encode(INPUT),
      polka: polka.encode(INPUT_POLKA),
      parity: parity.encode(INPUT),
    })
  })

  test('Different decoders are identical', () => {
    const NUMBERS = factory()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    assertAllCodecsDecodeTheSame(ENCODED, { scaleCodecCore, scaleCodecRuntime, parity })
  })

  test('Polka decodes OK', () => {
    const NUMBERS = factory()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    const decoded = polka.decode(ENCODED)

    const expected = nativeToPolka(NUMBERS)
    expect(decoded.toHuman()).toEqual(expected.toHuman())
  })
})
