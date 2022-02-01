/**
 * Function that receives bytes and returns {@link DecodeResult}
 */
export type Decode<T> = (walker: Walker) => T

/**
 * Function that receives value and yields encoded parts of this value
 */
export type Encode<T> = {
    (value: T, walker: Walker): void
    sizeHint: (value: T) => number
}

export interface Walker {
    u8: Uint8Array
    view: DataView
    idx: number
}
