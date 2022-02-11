import { CodecSimplified } from '../src/types'

export function assertAllCodecsEncodeTheSame<T>(value: T, codecs: Record<string, CodecSimplified<T>>) {
    let firstEncoded: Uint8Array | null = null
    const resultsMap: Record<string, Uint8Array> = {}
    const expectedMap: Record<string, Uint8Array> = {}

    for (const [name, codec] of Object.entries(codecs)) {
        const result = codec.encode(value)
        if (!firstEncoded) {
            firstEncoded = result

            expectedMap[name] = result
            resultsMap[name] = result
        } else {
            expectedMap[name] = firstEncoded
            resultsMap[name] = result
        }
    }

    expect(resultsMap).toEqual(expectedMap)
}

export function assertAllCodecsDecodeTheSame<T>(input: Uint8Array, codecs: Record<string, CodecSimplified<T>>) {
    let firstDecoded: T | null = null
    const resultsMap: Record<string, T> = {}
    const expectedMap: Record<string, T> = {}

    for (const [name, codec] of Object.entries(codecs)) {
        const result = codec.decode(input.slice())
        if (!firstDecoded) {
            firstDecoded = result

            expectedMap[name] = result
            resultsMap[name] = result
        } else {
            expectedMap[name] = firstDecoded
            resultsMap[name] = result
        }
    }

    expect(resultsMap).toEqual(expectedMap)
}
