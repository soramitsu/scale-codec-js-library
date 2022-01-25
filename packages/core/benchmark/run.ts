import { suite, add, cycle, complete, save } from 'benny'
import * as current from '../src/lib'
import * as lts from 'scale-core-npm'
import pkg from '../package.json'
import { concatBytes } from '@scale-codec/util'

type CoreLibTy = typeof current

const ltsPublished = pkg.devDependencies['scale-core-npm']

function saveWithName(file: string) {
    return save({
        file,
        folder: 'benchmark/report',
        format: 'json',
    })
}

async function deepNestedStruct() {
    type Node = {
        bytesVec: Uint8Array
        child: current.Option<Node>
    }

    const ORDER: (keyof Node)[] = ['bytesVec', 'child']

    const VALUE: Node = new Array(15)
        .fill(0)
        .reduce<current.Option<Node>>(
            (prev) =>
                current.Enum.valuable('Some', {
                    bytesVec: new Uint8Array(new Array(32).fill(255)),
                    child: prev,
                }),
            current.Enum.empty('None'),
        )
        .as('Some')

    function caseCurrent() {
        const encode: current.Encode<Node> = (node: Node) => current.encodeStruct(node, encoders, ORDER)
        const decode: current.Decode<Node> = (bytes) => current.decodeStruct(bytes, decoders, ORDER)

        const optEncoders: current.EnumEncoders = {
            None: { d: 0 },
            Some: { d: 1, encode },
        }

        const optDecoders: current.EnumDecoders = {
            0: { v: 'None' },
            1: { v: 'Some', decode },
        }

        const encoders: current.StructEncoders<Node> = {
            bytesVec: current.encodeUint8Vec,
            child: (en) => current.encodeEnum(en, optEncoders),
        }

        const decoders: current.StructDecoders<Node> = {
            bytesVec: current.decodeUint8Vec,
            child: (en) => current.decodeEnum(en, optDecoders),
        }

        return () => {
            concatBytes(encode(VALUE))
        }
    }

    function caseLts() {
        const encode: lts.Encode<Node> = (node: Node) => lts.encodeStruct(node, encoders, ORDER)
        const decode: lts.Decode<Node> = (bytes) => lts.decodeStruct(bytes, decoders, ORDER)

        const optEncoders: lts.EnumEncoders = {
            None: { d: 0 },
            Some: { d: 1, encode },
        }

        const optDecoders: lts.EnumDecoders = {
            0: { v: 'None' },
            1: { v: 'Some', decode },
        }

        const encoders: lts.StructEncoders<Node> = {
            bytesVec: lts.encodeUint8Vec,
            child: (en) => lts.encodeEnum(en, optEncoders),
        }

        const decoders: lts.StructDecoders<Node> = {
            bytesVec: lts.decodeUint8Vec,
            child: (en) => lts.decodeEnum(en, optDecoders),
        }

        return () => {
            encode(VALUE)
        }
    }

    await suite('encode deep fractal struct', add('current', caseCurrent), add('lts', caseLts), cycle(), complete())
}

async function main() {
    //     await numbers()
    //     await structs()
    //     await tuples()
    //     await enums()
    //     await sets()
    //     await complex()
    await deepNestedStruct()
}

main().catch((err) => {
    console.error('fatal', err)
    process.exit(1)
})
