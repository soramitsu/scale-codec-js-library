export type DecodeResult<T> = [value: T, decodedBytes: number];

export type Decode<T> = (bytes: Uint8Array) => DecodeResult<T>;

export type Encode<T> = (value: T) => Uint8Array;

export interface Codec<T> {
    encode: Encode<T>;
    decode: Decode<T>;
}
