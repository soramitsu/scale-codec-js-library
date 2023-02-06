import { describe, expect, test } from 'vitest'
import {
  Codec,
  Encode,
  Enumerate,
  RustOption,
  WalkerImpl,
  createEnumEncoder,
  createMapEncoder,
  createOptionEncoder,
  createSetEncoder,
  createStructEncoder,
  createVecEncoder,
  encodeBool,
  encodeStr,
  encodeU8,
  variant,
} from '@scale-codec/definition-runtime'
import { Character, MapStrU8, Msg, OptionMsg, SetU8, StrAlias, VecBool } from '../samples/complexNamespace'

type CaseWrapped<T> = [T, Codec<T>, Uint8Array]

function defineCase<T>({
  codec,
  value,
  expectedBytes,
}: {
  codec: Codec<T>
  value: T
  expectedBytes: Uint8Array
}): CaseWrapped<T> {
  return [value, codec, expectedBytes]
}

const encodeSetU8: Encode<Set<number>> = createSetEncoder(encodeU8)

type RawMsgEnum = Enumerate<{ Quit: []; Greeting: [string] }>
const encodeMsgEnum: Encode<RawMsgEnum> = createEnumEncoder<RawMsgEnum>({ Quit: 0, Greeting: [1, encodeStr] })

const encodeOption: Encode<RustOption<RawMsgEnum>> = createOptionEncoder(encodeMsgEnum)

describe.concurrent('Complex namespace', () => {
  test.each([
    defineCase<MapStrU8>({
      codec: MapStrU8,
      value: MapStrU8(new Map([['Hey', 56]])),
      expectedBytes: WalkerImpl.encode(new Map([['Hey', 56]]), createMapEncoder(encodeStr, encodeU8)),
    }),
    defineCase({
      codec: Character,
      value: Character({ name: 'Alice' }),
      expectedBytes: WalkerImpl.encode({ name: 'Alice' }, createStructEncoder([['name', encodeStr]])),
    }),
    defineCase<SetU8>({
      codec: SetU8,
      value: SetU8(new Set()),
      expectedBytes: WalkerImpl.encode(new Set(), encodeSetU8),
    }),
    defineCase<SetU8>({
      codec: SetU8,
      value: SetU8(new Set([51, 5])),
      expectedBytes: WalkerImpl.encode(new Set([51, 5]), encodeSetU8),
    }),
    defineCase({
      codec: Msg,
      value: Msg('Quit'),
      expectedBytes: WalkerImpl.encode(variant('Quit'), encodeMsgEnum),
    }),
    defineCase<VecBool>({
      codec: VecBool,
      value: VecBool([false]),
      expectedBytes: WalkerImpl.encode([false], createVecEncoder(encodeBool)),
    }),
    defineCase({ codec: StrAlias, value: 'wow', expectedBytes: WalkerImpl.encode('wow', encodeStr) }),
    defineCase({
      codec: OptionMsg,
      value: OptionMsg('None'),
      expectedBytes: WalkerImpl.encode(variant('None'), encodeOption),
    }),
  ])('Encode & decode %p', (value, codec, expectedBytes) => {
    const actualBytes = (codec as Codec<any>).toBuffer(value)

    expect(actualBytes).toEqual(expectedBytes)

    const actualValue = (codec as Codec<any>).fromBuffer(expectedBytes)

    expect(actualValue).toEqual(value)
  })
})
