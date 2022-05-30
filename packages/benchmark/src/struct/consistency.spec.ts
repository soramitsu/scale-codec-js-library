import { test } from 'vitest'
import { assertAllKeysHaveTheSameValue } from '../../test/util'
import polka from './polka'
import core from './core'
import runtime from './runtime'
import { factory } from './util'

test('Encode is consistent', () => {
  assertAllKeysHaveTheSameValue({
    core: core.encode(factory()),
    runtime: runtime.encode(factory()),
    polka: polka.encode(factory() as any),
  })
})

test('Decode is consistent', () => {
  const ENCODED = core.encode(factory())

  assertAllKeysHaveTheSameValue({
    core: core.decode(ENCODED),
    runtime: runtime.decode(ENCODED),
    polka: polka.decode(ENCODED).toHuman(),
  })
})
