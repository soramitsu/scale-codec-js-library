import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import * as parity from './parity'
import * as core from './core'
import * as runtime from './runtime'
import { DEEP_STRUCT_U32, DEEP_STRUCT_UNIT } from './shared'
import { caseName, encodeDecodeSuitePair } from '../bench-util'
import { add } from 'benny'

if (import.meta.vitest) {
  const { describe, test } = import.meta.vitest

  describe('consistency - unit struct', () => {
    test('encode', () => {
      assertAllCodecsEncodeTheSame(DEEP_STRUCT_UNIT, { core: core.unit, parity: parity.unit, runtime: runtime.unit })
    })

    test('decode', () => {
      assertAllCodecsDecodeTheSame(new Uint8Array([]), { core: core.unit, parity: parity.unit, runtime: runtime.unit })
    })
  })

  describe('consistency - u32 struct', () => {
    test('encode', () => {
      assertAllCodecsEncodeTheSame(DEEP_STRUCT_U32, { core: core.u32, parity: parity.u32, runtime: runtime.u32 })
    })

    test('decode', () => {
      assertAllCodecsDecodeTheSame(core.u32.encode(DEEP_STRUCT_U32), {
        core: core.u32,
        parity: parity.u32,
        runtime: runtime.u32,
      })
    })
  })
}

export default async function () {
  const EMPTY_ARRAY = new Uint8Array()
  const ENCODED_U32 = core.u32.encode(DEEP_STRUCT_U32)

  await encodeDecodeSuitePair(
    'Deep zero-size struct',
    'struct-deep-unit',
    [
      add(caseName('core'), () => {
        core.unit.encode(DEEP_STRUCT_UNIT)
      }),
      add(caseName('runtime'), () => {
        runtime.unit.encode(DEEP_STRUCT_UNIT)
      }),
      add(caseName('parity'), () => {
        parity.unit.encode(DEEP_STRUCT_UNIT)
      }),
    ],
    [
      add(caseName('core'), () => {
        core.unit.decode(EMPTY_ARRAY)
      }),
      add(caseName('runtime'), () => {
        runtime.unit.decode(EMPTY_ARRAY)
      }),
      add(caseName('parity'), () => {
        parity.unit.decode(EMPTY_ARRAY)
      }),
    ],
  )

  await encodeDecodeSuitePair(
    'Deep struct with a single u32 value',
    'struct-deep-u32',
    [
      add(caseName('core'), () => {
        core.u32.encode(DEEP_STRUCT_U32)
      }),
      add(caseName('runtime'), () => {
        runtime.u32.encode(DEEP_STRUCT_U32)
      }),
      add(caseName('parity'), () => {
        parity.u32.encode(DEEP_STRUCT_U32)
      }),
    ],
    [
      add(caseName('core'), () => {
        core.u32.decode(ENCODED_U32)
      }),
      add(caseName('runtime'), () => {
        runtime.u32.decode(ENCODED_U32)
      }),
      add(caseName('parity'), () => {
        parity.u32.decode(ENCODED_U32)
      }),
    ],
  )
}
