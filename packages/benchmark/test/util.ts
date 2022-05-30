import { expect } from 'vitest'
import { CodecSimplified } from '../src/types'

export function assertAllKeysHaveTheSameValue<T>(rec: Record<string, T>, value?: T) {
  const expected: Record<string, T> = {}
  let forceValue = value

  for (const [key, value] of Object.entries(rec)) {
    if (!forceValue) {
      forceValue = value
    }
    expected[key] = forceValue
  }

  expect(rec).toEqual(expected)
}

export function assertAllCodecsEncodeTheSame<T>(value: T, codecs: Record<string, CodecSimplified<T>>) {
  assertAllKeysHaveTheSameValue(
    Object.fromEntries(Object.entries(codecs).map(([name, codec]) => [name, codec.encode(value)])),
  )
}

export function assertAllCodecsDecodeTheSame<T>(input: Uint8Array, codecs: Record<string, CodecSimplified<T>>) {
  assertAllKeysHaveTheSameValue(
    Object.fromEntries(Object.entries(codecs).map(([name, codec]) => [name, codec.decode(input.slice())])),
  )
}
