import { add } from 'benny'
import { caseName, encodeDecodeSuitePair } from '../bench-util'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factory } from './util'
import parity from './parity'

export default async function () {
  const VALUE = factory()
  const ENCODED = core.encode(VALUE)

  await encodeDecodeSuitePair(
    'Struct',
    'struct',
    [
      add(caseName('core'), () => {
        core.encode(VALUE)
      }),
      add(caseName('runtime'), () => {
        runtime.encode(VALUE)
      }),
      add(caseName('polka'), () => {
        polka.encode(VALUE as any)
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
      add(caseName('polka'), () => {
        polka.decode(ENCODED)
      }),
      add(caseName('parity'), () => {
        parity.decode(ENCODED)
      }),
    ],
  )
}
