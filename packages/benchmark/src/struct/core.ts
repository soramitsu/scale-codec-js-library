import { WalkerImpl, createStructDecoder, createStructEncoder, decodeBool, encodeBool } from '@scale-codec/core'
import { defineCodec } from '../types'
import { factory } from './util'

const encoder = createStructEncoder(Object.keys(factory()).map((key) => [key, encodeBool]))
const decoder = createStructDecoder(Object.keys(factory()).map((key) => [key, decodeBool]))

export default defineCodec({
  encode: (val) => WalkerImpl.encode(val, encoder),
  decode: (input) => WalkerImpl.decode(input, decoder),
})
