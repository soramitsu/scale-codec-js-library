import { add, complete, cycle, suite } from 'benny'
import { saveCustom } from '../shared'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factory } from './util'

export default async function () {
  const VALUE = factory()
  const ENCODED = core.encode(VALUE)

  await suite(
    'Encoding struct',
    add('core', () => {
      core.encode(VALUE)
    }),
    add('runtime', () => {
      runtime.encode(VALUE)
    }),
    add('@polkadot/types', () => {
      polka.encode(VALUE as any)
    }),
    cycle(),
    complete(),
    saveCustom('struct-encode'),
  )

  await suite(
    'Decoding struct',
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
    saveCustom('struct-decode'),
  )
}
