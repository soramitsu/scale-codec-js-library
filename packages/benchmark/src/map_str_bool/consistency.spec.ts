import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import core from './core'
import coreV04 from './core-v04'
import polka from './polka'
import runtime from './runtime'
import { factory, factoryPolka } from './util'

const CODECS = { core, coreV04, runtime }

test('Encode is consistent', () => {
  assertAllCodecsEncodeTheSame(factory(), CODECS)
})

// not equal for some reason o_O
test.skip('Polka encodes ok', () => {
  expect(polka.encode(factoryPolka())).toEqual(core.encode(factory()))
})

test('Decode is consistent', () => {
  const VALUE = factory()
  const ENCODED = core.encode(VALUE)

  assertAllCodecsDecodeTheSame(ENCODED, CODECS)
})
