import { createEnumEncoder, Enum } from '@scale-codec/core'

export type Type = Enum<'None' | ['Some', Type]>

// const encoder = createEnumEncoder('')

export const encode = (val: Type): Uint8Array => {
    return new Uint8Array()
}
