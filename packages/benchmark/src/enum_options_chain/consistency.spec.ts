import { describe, expect, test } from 'vitest'
import { assertAllKeysHaveTheSameValue } from '../../test/util'
import core from './core'
import coreV04 from './core-v04'
import polka from './polka'
import runtime from './runtime'
import { factoryCore, factoryCoreV04, factoryPolka, factoryRuntime } from './util'

describe('Consistency', () => {
  test('Encode is the same', () => {
    assertAllKeysHaveTheSameValue({
      core: core.encode(factoryCore(40)),
      coreV04: coreV04.encode(factoryCoreV04(40)),
      runtime: runtime.encode(factoryRuntime(40)),
      polka: polka.encode(factoryPolka(40)),
    })
  })

  test('Decode is the same', () => {
    const ENCODED = core.encode(factoryCore(40))

    expect(core.decode(ENCODED)).toEqual(factoryCore(40))
    expect(runtime.decode(ENCODED)).toEqual(factoryRuntime(40))
    expect(coreV04.decode(ENCODED)).toEqual(factoryCoreV04(40))
    expect(polka.decode(ENCODED).toHuman()).toEqual(factoryPolka(40).toHuman())
  })
})
