import { describe, test } from 'vitest'
import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import core from './core'
import coreV4 from './core-v4'
// import polka from './polka'
import runtime from './runtime'
import {
  factory,
  // nativeToPolka
} from './util'

const CODECS = { core, coreV4, runtime }

describe.concurrent('Render imports', () => {
  test('Encode is consistent', () => {
    assertAllCodecsEncodeTheSame(factory(), CODECS)
  })

  // test('Polka encodes OK', () => {
  //     expect(polka.encode(nativeToPolka(factory()))).toEqual(core.encode(factory()))
  // })

  test('Decode is consistent', () => {
    assertAllCodecsDecodeTheSame(core.encode(factory()), CODECS)
  })
})
