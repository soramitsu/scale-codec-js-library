import { TypeRegistry, Enum } from '@polkadot/types'
import { defineCodec } from '../types'

export const registry = new TypeRegistry()

registry.register({
  Chain: {
    _enum: {
      None: null,
      Some: 'Chain',
    },
  },
})

export const Type = registry.createClass('Chain')

export default defineCodec<Enum>({
  encode: (x) => new Type(registry, x).toU8a(),
  decode: (bytes) => new Type(registry, bytes) as any,
})
