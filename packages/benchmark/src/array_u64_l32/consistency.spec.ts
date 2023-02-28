import { describe, expect, test } from 'vitest'
import { assertAllCodecsDecodeTheSame, assertAllKeysHaveTheSameValue } from '../../test/util'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecRuntime from './scale-codec-runtime'
import { factory, nativeToPolka } from './util'

// export function factoryValue(): bigint[] {
//     return Array.from({ length: 32 }, (_, i) => BigInt(i))
// }

// const CODECS = { scaleCodecCore, scaleCodecCoreV4, scaleCodecRuntime, scaleCodecRuntimeV8 }

describe.concurrent('Render imports', () => {
  test('Different encoders are identical', () => {
    const INPUT = factory()
    const INPUT_POLKA = nativeToPolka(INPUT)

    assertAllKeysHaveTheSameValue({
      core: scaleCodecCore.encode(INPUT),
      runtime: scaleCodecRuntime.encode(INPUT),
      polka: polka.encode(INPUT_POLKA),
    })
  })

  test('Different decoders are identical', () => {
    const NUMBERS = factory()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    assertAllCodecsDecodeTheSame(ENCODED, { scaleCodecCore, scaleCodecRuntime })
  })

  test('Polka decodes OK', () => {
    const NUMBERS = factory()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    const decoded = polka.decode(ENCODED)

    const expected = nativeToPolka(NUMBERS)
    expect(decoded.toHuman()).toEqual(expected.toHuman())
  })
})
