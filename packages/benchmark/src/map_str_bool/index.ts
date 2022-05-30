import { add, complete, cycle, suite } from 'benny'
import { saveCustom } from '../shared'
import core from './core'
import coreV04 from './core-v04'
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
    add('core v 0.4', () => {
      coreV04.encode(VALUE)
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
    add('core v 0.4', () => {
      coreV04.decode(ENCODED)
    }),
    add('@polkadot/types', () => {
      polka.decode(ENCODED)
    }),
    cycle(),
    complete(),
    saveCustom('map-str-bool-decode'),
  )
}
