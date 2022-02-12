import { TypeRegistry } from '@polkadot/types'
import { defineCodec } from '../types'

export const reg = new TypeRegistry()
export const MapType = reg.createClass('BTreeMap<String, bool>')

export default defineCodec({
    encode: (x) => new MapType(reg, x).toU8a(),
    decode: (input) => new MapType(reg, input),
})
