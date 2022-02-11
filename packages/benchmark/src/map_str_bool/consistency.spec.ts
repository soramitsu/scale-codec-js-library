import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import core from './core'
import coreV04 from './core-v04'
import runtime from './runtime'
import { factory } from './util'

const CODECS = { core, coreV04, runtime }

test('Encode is consistent', () => {
    assertAllCodecsEncodeTheSame(factory(), CODECS)
})

test('Decode is consistent', () => {
    const VALUE = factory()
    const ENCODED = core.encode(VALUE)

    assertAllCodecsDecodeTheSame(ENCODED, CODECS)
})
