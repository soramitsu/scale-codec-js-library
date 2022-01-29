import { suite, add, cycle, complete, save } from 'benny'
import * as lts from 'scale-core-npm'
// import { encodeStr, createVecEncoder, encodeStrCached, encodeStrWithHintJsComputing } from '../src/codecs'
import { WalkerImpl } from '../src/util'

async function suiteStrings() {
    const INPUT = Array.from({ length: 124 }, () => String(Math.random()))

    await suite(
        'Encode vec of strings',
        add('lts implementation', () => {
            const bytes = lts.encodeVec(INPUT, lts.encodeStr)
        }),
        add('new implementation', () => {
            const encodeInput = createVecEncoder(encodeStr)

            return () => {
                const bytes = WalkerImpl.encode(INPUT, encodeInput)
            }
        }),
        add('new implementation with cache', () => {
            const encodeInput = createVecEncoder(encodeStrCached)

            return () => {
                const bytes = WalkerImpl.encode(INPUT, encodeInput)
            }
        }),
        add('new implementation with JS bytes couting', () => {
            const encodeInput = createVecEncoder(encodeStrWithHintJsComputing)

            return () => {
                const bytes = WalkerImpl.encode(INPUT, encodeInput)
            }
        }),
        cycle(),
        complete(),
    )
}

async function suiteIterations() {
    const ARRAY = Array.from({ length: 1000 }, (v, k) => k)

    // await suite(
    //     'Iterations',
    //     add('for ', () => {
    //         let sum = 0
    //         for (let i = 0, len = ARRAY.length; i < len; i++) {
    //             sum += ARRAY[i]
    //         }
    //     }),
    //     add('for of', () => {
    //         let sum = 0
    //         for (const item of ARRAY) {
    //             sum += item
    //         }
    //     }),
    //     add('forEach', () => {
    //         let sum = 0
    //         ARRAY.forEach((item) => {
    //             sum += item
    //         })
    //     }),
    //     add('reduce', () => {
    //         const sum = ARRAY.reduce((a, b) => a + b, 0)
    //     }),
    //     cycle(),
    //     complete(),
    // )

    const ARRAY_TUPLES: [string, string][] = Array.from({ length: 1000 }, (v, k) => [`key ${k}`, `value ${k}`])

    console.log(ARRAY_TUPLES)

    await suite(
        'Iterations with destructuring',
        add('for destructure', () => {
            // const obj = {}
            for (let i = ARRAY_TUPLES.length - 1; i >= 0; i--) {
                const [key, value] = ARRAY_TUPLES[i]
                const res = key + value
                // obj[key] = value
            }
        }),
        add('for no destructure', () => {
            // const obj = {}
            for (let i = ARRAY_TUPLES.length - 1; i >= 0; i--) {
                const res = ARRAY_TUPLES[i][0] + ARRAY_TUPLES[i][1]
                // obj[kv[0]] = kv[1]
            }
        }),
        add('for smart destructure', () => {
            // const obj = {}
            for (let i = ARRAY_TUPLES.length - 1, key = null, value = null; i >= 0; i--) {
                ;[key, value] = ARRAY_TUPLES[i]
                const res = key + value
                // obj[key] = value
            }
        }),
        add('for manual destruct', () => {
            // const obj = {}
            for (let i = ARRAY_TUPLES.length - 1, key = null, value = null; i >= 0; i--) {
                key = ARRAY_TUPLES[i][0]
                value = ARRAY_TUPLES[i][1]
                const res = key + value
                // obj[key] = value
            }
        }),
        cycle(),
        complete(),
    )
}

async function setTraverse() {
    const SET = new Set(Array.from({ length: 300 }, (k, i) => i))

    await suite(
        'Set traverse',
        add('values() => for of', () => {
            let sum = 0
            for (const item of SET.values()) {
                sum += item
            }
        }),
        add('for of', () => {
            let sum = 0
            for (const item of SET) {
                sum += item
            }
        }),
        add('forEach', () => {
            let sum = 0
            SET.forEach((item) => {
                sum += item
            })
        }),
        add('values() => for i', () => {
            let sum = 0
            const vals = [...SET.values()]
            for (let i = 0, len = SET.size; i < len; i++) {
                sum += vals[i]
            }
        }),
        cycle(),
        complete(),
    )
}

async function mapTraverse() {
    const MAP = new Map(Array.from({ length: 300 }, (k, i) => [i, i]))

    await suite(
        'Map traverse',
        add(
            'for of',
            () => {
                let sum = 0
                for (const [k, v] of MAP) {
                    sum += k + v
                }
            },
            { initCount: 300_000 },
        ),
        add(
            'for of entries() (no destruct)',
            () => {
                let sum = 0
                for (const item of MAP.entries()) {
                    sum += item[0] + item[1]
                }
            },
            { initCount: 300_000 },
        ),
        add(
            'for of keys() + values()',
            () => {
                let sum = 0
                for (const key of MAP.keys()) {
                    sum += key
                }
                for (const value of MAP.values()) {
                    sum += value
                }
            },
            { initCount: 300_000 },
        ),
        add('for of keys() => get()', () => {
            let sum = 0
            for (const key of MAP.keys()) {
                sum += key + MAP.get(key)!
            }
        }),
        // add('forEach', () => {
        //     let sum = 0
        //     SET.forEach((item) => {
        //         sum += item
        //     })
        // }),
        // add('values() => for i', () => {
        //     let sum = 0
        //     const vals = [...SET.values()]
        //     for (let i = 0, len = SET.size; i < len; i++) {
        //         sum += vals[i]
        //     }
        // }),
        cycle(),
        complete(),
    )
}

async function main() {
    // await suiteStrings()
    // await suiteIterations()
    await mapTraverse()
}

main().catch((err) => {
    console.error('fatal', err)
    process.exit(1)
})
