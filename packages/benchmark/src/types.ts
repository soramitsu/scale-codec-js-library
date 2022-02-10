export function defineCodec<T>(codec: CodecSimplified<T>): CodecSimplified<T> {
    return codec
}

type CodecSimplified<T> = {
    encode: (value: T) => Uint8Array
    decode: (input: Uint8Array) => T
}
