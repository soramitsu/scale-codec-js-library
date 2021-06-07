export type DecodeResult<T> = [value: T, decodedBytes: number];

export type Decoder<T> = (bytes: Uint8Array) => DecodeResult<T>;

export type Encoder<T> = (value: T) => Uint8Array;
