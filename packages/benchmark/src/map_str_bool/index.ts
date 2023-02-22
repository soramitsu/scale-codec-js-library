import { add } from 'benny'
import { caseName, encodeDecodeSuitePair } from '../shared'
import core from './core'
import parity from './parity'
import polka from './polka'
import runtime from './runtime'
import { factory, factoryPolka } from './util'

export default async function () {
  const VALUE = factory()
  const VALUE_POLKA = factoryPolka()
  const ENCODED = core.encode(VALUE)

  await encodeDecodeSuitePair(
    'Map<string, boolean>',
    'map-str-bool',
    [
      add(caseName('core'), () => {
        core.encode(VALUE)
      }),
      add(caseName('runtime'), () => {
        runtime.encode(VALUE)
      }),
      add(caseName('polka'), () => {
        polka.encode(VALUE_POLKA)
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
