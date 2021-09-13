/**
 * Unified result of decoding is a tuple with value and count of decoded bytes
 */
export type DecodeResult<T> = [value: T, decodedBytes: number];

/**
 * Function that receives bytes and outputs the decoded value from these bytes and count of decoded bytes
 */
export type Decode<T> = (bytes: Uint8Array) => DecodeResult<T>;

/**
 * Function that receives value and output encoded bytes of this value
 */
export type Encode<T> = (value: T) => Uint8Array;
