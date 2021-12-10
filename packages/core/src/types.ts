/**
 * Unified decode result which is a tuple with a value and a count of decoded bytes
 */
export type DecodeResult<T> = [value: T, decodedBytes: number]

/**
 * Function that receives bytes and returns {@link DecodeResult}
 */
export type Decode<T> = (bytes: Uint8Array) => DecodeResult<T>

/**
 * Function that receives value and output encoded bytes of this value
 */
export type Encode<T> = (value: T) => Uint8Array
