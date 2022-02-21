/**
 * Function that decodes data from a walker and yields it
 */
export type Decode<T> = (walker: Walker) => T

/**
 * Function that computes encoded size hint for a value and then receives that
 * value again and encodes it into a walker
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
