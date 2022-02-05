import { WalkerImpl } from '@scale-codec/core'
import { dynBuilder } from '../builder-creators'
import { Fragment } from '../fragment'
import { Bool } from '../presets'

function compareInstances(actual: Fragment<any>, expected: Fragment<any>) {
    expect(actual.unwrap()).toEqual(expected.unwrap())
    expect(actual.bytes).toEqual(expected.bytes)
}

describe('Testing DynBool', () => {
    const DynBool = dynBuilder(() => Bool)

    test('fromValue() works as original', () => {
        compareInstances(DynBool.fromValue(false), Bool.fromValue(false))
    })

    test('fromBytes() works as original', () => {
        compareInstances(DynBool.fromBuffer(new Uint8Array([1])), Bool.fromBuffer(new Uint8Array([1])))
    })

    test('decodeRaw() the same', () => {
        const bytes = new Uint8Array([0])

        const a = WalkerImpl.decode(bytes, (w) => DynBool.decode(w))
        const b = WalkerImpl.decode(bytes, (w) => Bool.decode(w))

        compareInstances(a, b)
    })

    test('wrap() the same', () => {
        compareInstances(DynBool.wrap(true), Bool.wrap(true))
    })

    test('getBuilder() returns just Bool', () => {
        expect(DynBool.getBuilder()).toBe(Bool)
    })
})
