import { suite, add, cycle, complete, save } from 'benny'
import * as current from '../src/lib'
import * as lts from 'scale-core-npm'
import pkg from '../package.json'

type CoreLibTy = typeof current

const ltsPublished = pkg.devDependencies['scale-core-npm']

function saveWithName(file: string) {
    return save({
        file,
        folder: 'benchmark/report',
        format: 'json',
    })
}

async function structs() {
    function smallStructCase(label: string, lib: CoreLibTy) {
        return add(label, () => {
            type TestStruct = {
                foo: boolean
            }

            const struct: TestStruct = {
                foo: true,
            }

            const encoders: current.StructEncoders<TestStruct> = {
                foo: lib.encodeBool,
            }

            const decoders: current.StructDecoders<TestStruct> = {
                foo: lib.decodeBool,
            }

            const order: Array<keyof TestStruct> = ['foo']

            return () => {
                const bytes = lib.encodeStruct(struct, encoders, order)
                lib.decodeStruct(bytes, decoders, order)
            }
        })
    }

    function bigStructCase(label: string, lib: CoreLibTy) {
        return add(label, () => {
            const struct = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [i, false]))
            const keys = Object.keys(struct)
            const encoders = Object.fromEntries(keys.map((key) => [key, lib.encodeBool]))
            const decoders = Object.fromEntries(keys.map((key) => [key, lib.decodeBool]))

            return () => {
                const bytes = lib.encodeStruct(struct, encoders, keys)
                lib.decodeStruct(bytes, decoders, keys)
            }
        })
    }

    await suite(
        'Small struct encode/decode',
        smallStructCase('current', current),
        smallStructCase(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('struct-big'),
    )

    await suite(
        'Big struct encode/decode',
        bigStructCase('current', current),
        bigStructCase(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('struct-small'),
    )
}

async function tuples() {
    function smallTupleCase(label: string, { encodeBool, decodeBool, encodeTuple, decodeTuple }: CoreLibTy) {
        return add(label, () => {
            const tuple = [true]
            const encoders = [encodeBool]
            const decoders = [decodeBool]

            return () => {
                const bytes = encodeTuple(tuple, encoders as any)
                decodeTuple(bytes, decoders as any)
            }
        })
    }

    function notVerySmallTupleCase(label: string, { encodeTuple, decodeTuple, encodeBool, decodeBool }: CoreLibTy) {
        return add(label, () => {
            const tuple = new Array(25).fill(true)
            const encoders = tuple.map(() => encodeBool)
            const decoders = tuple.map(() => decodeBool)

            return () => {
                decodeTuple(encodeTuple(tuple, encoders as any), decoders as any)
            }
        })
    }

    await suite(
        'Small tuple encode/decode',
        smallTupleCase('current', current),
        smallTupleCase(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('tuple-small'),
    )

    await suite(
        'Not very small tuple encode/decode',
        notVerySmallTupleCase('current', current),
        notVerySmallTupleCase(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('tuple-not-very-small'),
    )
}

async function enums() {
    function caseFactory(label: string, { Enum, encodeBool, decodeBool, encodeEnum, decodeEnum }: CoreLibTy) {
        return add(label, () => {
            type TestEnum = current.Option<boolean>

            const enum1: TestEnum = Enum.empty('None')
            const enum2: TestEnum = Enum.valuable('Some', true)

            const encoders: current.EnumEncoders = {
                None: { d: 0 },
                Some: { d: 1, encode: encodeBool },
            }

            const decoders: current.EnumDecoders = {
                0: { v: 'None' },
                1: { v: 'Some', decode: decodeBool },
            }

            return () => {
                for (const val of [enum1, enum2]) {
                    decodeEnum(encodeEnum(val, encoders), decoders)
                }
            }
        })
    }

    await suite(
        'Enum, empty and valuable',
        caseFactory('current', current),
        caseFactory(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('enum'),
    )
}

async function sets() {
    function smallSetCaseFactory(label: string, { encodeSet, decodeSet, encodeBool, decodeBool }: CoreLibTy) {
        return add(
            label,
            () => {
                const value = new Set([false, true])

                return () => {
                    decodeSet(encodeSet(value, encodeBool), decodeBool)
                }
            },
            {
                initCount: 500_000,
            },
        )
    }
    function bigSetCaseFactory(label: string, { encodeSet, decodeSet, encodeInt, decodeInt }: CoreLibTy) {
        return add(
            label,
            () => {
                const value = new Set(Array.from({ length: 1000 }, (v, i) => i * 20))
                const encode: current.Encode<typeof value> = (v) => encodeSet(v, (n) => encodeInt(n, 'u32'))
                const decode: current.Decode<typeof value> = (v) => decodeSet(v, (n) => decodeInt(n, 'u32'))

                return () => {
                    decode(encode(value))
                }
            },
            {
                initCount: 100,
            },
        )
    }

    await suite(
        'Small set',
        smallSetCaseFactory('current', current),
        smallSetCaseFactory(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('sets-small'),
    )

    await suite(
        'Big set',
        bigSetCaseFactory('current', current),
        bigSetCaseFactory(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('sets-big'),
    )
}

async function numbers() {
    // eslint-disable-next-line max-params
    function intCase(label: string, { decodeInt, encodeInt }: CoreLibTy, num: number, ty: current.IntTypes) {
        return add(
            label,
            () => {
                decodeInt(encodeInt(num, ty), ty)
            },
            { initCount: 1_000_000 },
        )
    }
    // eslint-disable-next-line max-params
    function bigIntCase(
        label: string,
        { decodeBigInt, encodeBigInt }: CoreLibTy,
        num: bigint,
        ty: current.BigIntTypes,
    ) {
        return add(
            label,
            () => {
                decodeBigInt(encodeBigInt(num, ty), ty)
            },
            { initCount: 1_000_000 },
        )
    }

    await suite(
        'u8',
        intCase(ltsPublished, lts, 128, 'u8'),
        intCase('current', current, 128, 'u8'),
        cycle(),
        complete(),
        saveWithName('nums-u8'),
    )

    await suite(
        'u8 (bigint)',
        bigIntCase(ltsPublished, lts, 128n, 'u8'),
        bigIntCase('current', current, 128n, 'u8'),
        cycle(),
        complete(),
        saveWithName('nums-u8-bigint'),
    )
}

async function complex() {
    function caseFactory(label: string, lib: CoreLibTy) {
        return add(
            label,
            () => {
                type Value = {
                    map: Map<string, bigint>
                    foo: string
                    bar: boolean
                    age: number
                    id: bigint
                    opt: current.Option<null>
                    children: Set<bigint>
                    arr: number[]
                    bytes: Uint8Array
                    vec: string[]
                    bytesVec: Uint8Array
                    tuple: [boolean, string]
                }

                const value: Value = {
                    map: new Map([
                        ['1', 1n],
                        ['2', 2n],
                        ['3', 333n],
                    ]),
                    foo: 'henno',
                    bar: false,
                    age: 225,
                    id: 81828828282828n,
                    opt: lib.Enum.valuable('Some', null),
                    children: new Set([16n, 12n, 99919n, 1772288n]),
                    arr: [0, 1, 2, 3, 4],
                    bytes: new Uint8Array(Array.from({ length: 32 }, () => 32)),
                    vec: ['one', 'two', 'three'],
                    bytesVec: new Uint8Array([6, 1, 2, 2, 3, 4, 1]),
                    tuple: [true, 'true'],
                }

                const ORDER: (keyof Value)[] = Object.keys(value) as any

                const encode: current.Encode<Value> = (val) =>
                    lib.encodeStruct(
                        val,
                        {
                            map: (val) => lib.encodeMap(val, lib.encodeStr, (n) => lib.encodeBigInt(n, 'u32')),
                            foo: lib.encodeStr,
                            bar: lib.encodeBool,
                            age: (n) => lib.encodeInt(n, 'u8'),
                            id: (n) => lib.encodeBigInt(n, 'i128'),
                            opt: (opt) =>
                                lib.encodeEnum(opt, { None: { d: 0 }, Some: { d: 1, encode: lib.encodeVoid } }),
                            children: (set) => lib.encodeSet(set, (n) => lib.encodeBigInt(n, 'u32')),
                            arr: (arr) => lib.encodeArray(arr, (n) => lib.encodeInt(n, 'i16'), 5),
                            bytes: (arr) => lib.encodeUint8Array(arr, 32),
                            vec: (vec) => lib.encodeVec(vec, lib.encodeStr),
                            bytesVec: (vec) => lib.encodeUint8Vec(vec),
                            tuple: (tuple) => lib.encodeTuple(tuple, [lib.encodeBool, lib.encodeStr]),
                        },
                        ORDER,
                    )

                const decode: current.Decode<Value> = (val) =>
                    lib.decodeStruct(
                        val,
                        {
                            map: (val) => lib.decodeMap(val, lib.decodeStr, (n) => lib.decodeBigInt(n, 'u32')),
                            foo: lib.decodeStr,
                            bar: lib.decodeBool,
                            age: (n) => lib.decodeInt(n, 'u8'),
                            id: (n) => lib.decodeBigInt(n, 'i128'),
                            opt: (opt) =>
                                lib.decodeEnum(opt, { 0: { v: 'None' }, 1: { v: 'Some', decode: lib.decodeVoid } }),
                            children: (set) => lib.decodeSet(set, (n) => lib.decodeBigInt(n, 'u32')),
                            arr: (arr) => lib.decodeArray(arr, (n) => lib.decodeInt(n, 'i16'), 5),
                            bytes: (arr) => lib.decodeUint8Array(arr, 32),
                            vec: (vec) => lib.decodeVec(vec, lib.decodeStr),
                            bytesVec: (vec) => lib.decodeUint8Vec(vec),
                            tuple: (tuple) => lib.decodeTuple(tuple, [lib.decodeBool, lib.decodeStr]),
                        },
                        ORDER,
                    )

                return () => {
                    decode(encode(value))
                }
            },
            {
                initCount: 1000,
            },
        )
    }

    await suite(
        'Complex',
        caseFactory('current', current),
        caseFactory(ltsPublished, lts),
        cycle(),
        complete(),
        saveWithName('complex'),
    )
}

async function main() {
    await numbers()
    await structs()
    await tuples()
    await enums()
    await sets()
    await complex()
}

main().catch((err) => {
    console.error('fatal', err)
    process.exit(1)
})
