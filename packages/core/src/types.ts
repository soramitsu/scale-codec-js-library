export type Decode<T> = (walker: Walker) => T

export type Encode<T> = {
    (value: T, walker: Walker): void
    sizeHint: (value: T) => number
}

export interface Walker {
    u8: Uint8Array
    view: DataView
    idx: number
}
