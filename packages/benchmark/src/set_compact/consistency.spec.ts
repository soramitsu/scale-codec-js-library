import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import core from './core'
import coreV4 from './core-v4'
import runtime from './runtime'
import { setFactory } from './util'

const CODECS = { core, coreV4, runtime }

test('Encode is consistent', () => {
    assertAllCodecsEncodeTheSame(setFactory(), CODECS)
})

test('Decode is consistent', () => {
    assertAllCodecsDecodeTheSame(core.encode(setFactory()), CODECS)
})
