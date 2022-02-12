import { TypeRegistry } from '@polkadot/types'
import { defineCodec } from '../types'

export const reg = new TypeRegistry()

// I don't know how Polka's Compact works. Why is it fixed?
// `core`s compact implementation is based on Rust's implementation...
export const PolkaType = reg.createClass('BTreeSet<Compact<BlockNumber>>')

export default defineCodec<Set<any>>({
    encode: (x) => new PolkaType(reg, x).toU8a(),
    decode: (x) => new PolkaType(reg, x) as any,
})
