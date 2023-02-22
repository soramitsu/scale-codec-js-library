import { describe, expect, test } from 'vitest'
import { assertAllCodecsDecodeTheSame, assertAllKeysHaveTheSameValue } from '../../test/util'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factoryCore, factoryParity, factoryPolka } from './util'
import parity from './parity'

describe('Consistency', () => {
  test('Encode is the same', () => {
    assertAllKeysHaveTheSameValue({
      core: core.encode(factoryCore(40)),
      runtime: runtime.encode(factoryCore(40)),
      polka: polka.encode(factoryPolka(40)),
      parity: parity.encode(factoryParity(40)),
    })
  })

  test('Decode is the same', () => {
    const ENCODED = core.encode(factoryCore(40))

    assertAllCodecsDecodeTheSame(ENCODED, { core, runtime })
    expect(polka.decode(ENCODED).toHuman()).toEqual(factoryPolka(40).toHuman())
    expect(parity.decode(ENCODED)).toEqual(factoryParity(40))
  })
})
