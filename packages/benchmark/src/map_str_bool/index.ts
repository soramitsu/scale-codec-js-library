import { add, complete, cycle, suite } from 'benny'
import { saveCustom } from '../shared'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factory, factoryPolka } from './util'

export default async function () {
  const VALUE = factory()
  const VALUE_POLKA = factoryPolka()
  const ENCODED = core.encode(VALUE)

  await suite(
    'Encode Map<string, boolean>',
    add('core', () => {
      core.encode(VALUE)
    }),
    add('runtime', () => {
      runtime.encode(VALUE)
    }),
    add('@polkadot/types', () => {
      polka.encode(VALUE_POLKA)
    }),
    cycle(),
    complete(),
    saveCustom('map-str-bool-encode'),
  )

  await suite(
    'Decode Map<string, boolean>',
    add('core', () => {
      core.decode(ENCODED)
    }),
    add('runtime', () => {
      runtime.decode(ENCODED)
    }),
    add('@polkadot/types', () => {
      polka.decode(ENCODED)
    }),
    cycle(),
    complete(),
    saveCustom('map-str-bool-decode'),
  )
}
