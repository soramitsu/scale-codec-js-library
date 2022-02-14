import { Enum, encodeEnum, decodeEnum, Encode, Decode, DecodeResult } from 'scale-codec-core-v-4'
import { defineCodec } from '../types'

export type Chain = Enum<{
    None: null
    Some: { value: Chain }
}>

function encode(x: Chain): Uint8Array {
    return encodeEnum(x, ENCODE_SCHEMA)
}

const ENCODE_SCHEMA = {
    None: { d: 0 },
    Some: { d: 1, encode },
}

function decode(x: Uint8Array): DecodeResult<Chain> {
    return decodeEnum(x, DECODE_SCHEMA)
}

const DECODE_SCHEMA = {
    0: { v: 'None' },
    1: { v: 'Some', decode },
}

export default defineCodec<Chain>({
    encode,
    decode: (x) => decode(x)[0],
})
