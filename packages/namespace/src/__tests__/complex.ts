import { Enum, EnumSchema, Option, Valuable } from '@scale-codec/core'
import { defBytesArray, defEnum, defOption, defStruct, defTuple, StdCodecs, StdTypes } from '../std'
import JSBI from 'jsbi'
import { defNamespace } from '../namespace'
import { defAlias } from '../alias'
import { yieldNTimes } from '@scale-codec/util'

describe('complex namespace', () => {
    type Namespace = StdTypes & {
        Id: {
            name: string
            domain: string
        }
        'Option<Id>': Option<Namespace['Id']>
        CustomEnum: Enum<{
            One: null
            Two: Valuable<Namespace['(u64,bool,(string,i32))']>
        }>
        '(string,i32)': [string, number]
        '(u64,bool,(string,i32))': [JSBI, boolean, [string, number]]
        // alias
        String: string
        // bytes fixed
        '[u8, 5]': Uint8Array
    }

    const ns = defNamespace<Namespace>({
        ...StdCodecs,
        Id: defStruct([
            ['name', 'str'],
            ['domain', 'str'],
        ]),
        'Option<Id>': defOption('Id'),
        '(u64,bool,(string,i32))': defTuple(['u64', 'bool', '(string,i32)']),
        '(string,i32)': defTuple(['str', 'i32']),
        CustomEnum: defEnum(
            new EnumSchema({
                One: { discriminant: 0 },
                Two: { discriminant: 1 },
            }),
            {
                Two: '(u64,bool,(string,i32))',
            },
        ),
        String: defAlias('str'),
        '[u8, 5]': defBytesArray(5),
    })

    const { encode, decode } = ns

    function bytes(...nums: number[]): Uint8Array {
        return new Uint8Array(nums)
    }

    function testCase<K extends keyof Namespace>(
        type: K,
        value: Namespace[K],
        encoded: Uint8Array,
    ): [K, Namespace[K], Uint8Array] {
        return [type, value, encoded]
    }

    test.each([
        testCase('bool', false, bytes(0)),
        testCase('bool', true, bytes(1)),
        testCase('u8', 15, bytes(15)),
        testCase('u16', 5812, bytes(180, 22)),
        testCase('u32', 420923, bytes(59, 108, 6, 0)),
        testCase('u64', JSBI.BigInt(41029823098), bytes(122, 106, 145, 141, 9, 0, 0, 0)),
        testCase('u128', JSBI.BigInt(40000820398404), bytes(68, 201, 176, 106, 97, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)),
        testCase('i8', -80, bytes(176)),
        testCase('i16', 5812, bytes(180, 22)),
        testCase('i32', -420923, bytes(197, 147, 249, 255)),
        testCase('i64', JSBI.BigInt(41029823098), bytes(122, 106, 145, 141, 9, 0, 0, 0)),
        testCase(
            'i128',
            JSBI.BigInt(-40000820398404),
            bytes(188, 54, 79, 149, 158, 219, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255),
        ),
        testCase('str', 'Holy Bible', bytes(40, 72, 111, 108, 121, 32, 66, 105, 98, 108, 101)),
        testCase('str', 'value', bytes(20, 118, 97, 108, 117, 101)),
        testCase('Id', { name: 'hey', domain: '44' }, bytes(12, 104, 101, 121, 8, 52, 52)),
        testCase('Option<Id>', Enum.create('None'), bytes(0)),
        testCase(
            'Option<Id>',
            Enum.create('Some', { domain: 'fool', name: 'bal' }),
            bytes(1, 12, 98, 97, 108, 16, 102, 111, 111, 108),
        ),
        testCase(
            '(string,i32)',
            ['something', 5_000_441],
            bytes(36, 115, 111, 109, 101, 116, 104, 105, 110, 103, 249, 76, 76, 0),
        ),
        testCase(
            '(u64,bool,(string,i32))',
            [JSBI.BigInt(15), false, ['--___--', -4123]],
            bytes(15, 0, 0, 0, 0, 0, 0, 0, 0, 28, 45, 45, 95, 95, 95, 45, 45, 229, 239, 255, 255),
        ),
        testCase('CustomEnum', Enum.create('One'), bytes(0)),
        testCase(
            'CustomEnum',
            Enum.create('Two', [JSBI.BigInt(15), false, ['--___--', -4123]]),
            bytes(1, 15, 0, 0, 0, 0, 0, 0, 0, 0, 28, 45, 45, 95, 95, 95, 45, 45, 229, 239, 255, 255),
        ),
        // array of bytes should equals to it's encoded representation
        testCase('[u8, 5]', bytes(1, 2, 3, 4, 5), bytes(1, 2, 3, 4, 5)),
        // vec of bytes
        testCase('Vec<u8>', bytes(1, 2, 3, 4, 5), bytes(20, 1, 2, 3, 4, 5)),
    ])('encode/decode %s', (ref, decoded, encoded) => {
        expect(encode(ref, decoded)).toEqual(encoded)
        expect(decode(ref, encoded)).toEqual(decoded)
    })

    test('alias', () => {
        expect(encode('str', 'boop')).toEqual(encode('String', 'boop'))
    })
})
