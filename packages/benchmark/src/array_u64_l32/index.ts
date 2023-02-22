import { add } from 'benny'

import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecRuntime from './scale-codec-runtime'
import { nativeToPolka } from './util'
import { caseName, encodeDecodeSuitePair } from '../shared'
import parity from './parity'

export default async function () {
  const INPUT_BIG_INTS = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
  const INPUT_POLKA = nativeToPolka(INPUT_BIG_INTS)
  const NUMBERS_ENCODED = scaleCodecCore.encode(INPUT_BIG_INTS)

  await encodeDecodeSuitePair(
    'Array [u64; 32]',
    'array-u64-32',
    [
      add(caseName('core'), () => {
        scaleCodecCore.encode(INPUT_BIG_INTS)
      }),
      add(caseName('runtime'), () => {
        scaleCodecRuntime.encode(INPUT_BIG_INTS)
      }),
      add(caseName('polka'), () => {
        polka.encode(INPUT_POLKA)
      }),
      add(caseName('parity'), () => {
        parity.encode(INPUT_BIG_INTS)
      }),
    ],
    [
      add(caseName('core'), () => {
        scaleCodecCore.decode(NUMBERS_ENCODED)
      }),
      add(caseName('runtime'), () => {
        scaleCodecRuntime.decode(NUMBERS_ENCODED)
      }),
      add(caseName('polka'), () => {
        polka.decode(NUMBERS_ENCODED)
      }),
      add(caseName('parity'), () => {
        parity.decode(NUMBERS_ENCODED)
      }),
    ],
  )
}
