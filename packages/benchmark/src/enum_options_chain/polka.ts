import { Enum, TypeRegistry } from '@polkadot/types'
import { defineCodec } from '../types'

export const registry = new TypeRegistry()

registry.register({
  Chain: {
    inner: 'OptionChain',
  },
  OptionChain: {
    _enum: {
      None: null,
      Some: 'Chain',
    },
  },
})

export const Chain = registry.createClass('Chain')

export const OptionChain = registry.createClass('OptionChain')

export default defineCodec<Enum>({
  encode: (x) => new Chain(registry, x).toU8a(),
  decode: (bytes) => new Chain(registry, bytes) as any,
})
