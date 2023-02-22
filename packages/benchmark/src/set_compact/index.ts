import { add } from 'benny'
import { caseName, encodeDecodeSuitePair } from '../shared'
import core from './core'
import runtime from './runtime'
import { factory } from './util'
import parity from './parity'

export default async function () {
  const VALUE = factory()
  const ENCODED = core.encode(VALUE)

  await encodeDecodeSuitePair(
    'Set<Compact> with 50 entries',
    'set-compact',
    [
      add(caseName('core'), () => {
        core.encode(VALUE)
      }),
      add(caseName('runtime'), () => {
        runtime.encode(VALUE)
      }),
      add(caseName('parity'), () => {
        parity.encode(VALUE)
      }),
    ],
    [
      add(caseName('core'), () => {
        core.decode(ENCODED)
      }),
      add(caseName('runtime'), () => {
        runtime.decode(ENCODED)
      }),
      add(caseName('parity'), () => {
        parity.decode(ENCODED)
      }),
    ],
  )
}
