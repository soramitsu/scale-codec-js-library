import { decodeStrCompact, encodeStrCompact, Codec } from '@scale-codec/core'

export const str: Codec<string> = {
    encode: encodeStrCompact,
    decode: decodeStrCompact,
}
