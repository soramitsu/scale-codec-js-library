import { describe, test } from 'vitest'
import { assertAllCodecsEncodeTheSame, assertAllKeysHaveTheSameValue } from '../../test/util'
import polka from './polka'
import core from './core'
import runtime from './runtime'
import { factory } from './util'
import parity from './parity'

describe('Consistency', () => {
  test('Encode is consistent', () => {
    assertAllCodecsEncodeTheSame(factory(), { core, runtime, polka, parity })
  })

  test('Decode is consistent', () => {
    const ENCODED = core.encode(factory())

    assertAllKeysHaveTheSameValue({
      core: core.decode(ENCODED),
      runtime: runtime.decode(ENCODED),
      polka: polka.decode(ENCODED).toHuman(),
      parity: parity.decode(ENCODED),
    })
  })
})
