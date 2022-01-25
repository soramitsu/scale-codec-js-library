/**
 * `@scale-codec/*` shared utility functions
 * @packageDocumentation
 */

/**
 * Good-old assert
 */
export function assert(condition: unknown, message: string | (() => string)): asserts condition {
    if (!condition) {
        throw new Error(typeof message === 'function' ? message() : message)
    }
}

/**
 * Creates a concatenated `Uint8Array` from the inputs.
 */
export function concatBytes(iterable: Iterable<Uint8Array> | Array<Uint8Array>): Uint8Array {
    // constructing array + computing length
    let array: Array<Uint8Array>
    let bytesLength = 0

    if (Array.isArray(iterable)) {
        array = iterable
        for (let i = 0, arrLen = array.length; i < arrLen; i++) {
            bytesLength += array[i].byteLength
        }
    } else {
        array = []
        for (const part of iterable) {
            array.push(part)
            bytesLength += part.byteLength
        }
    }

    // filling target
    const target = new Uint8Array(bytesLength)

    for (let i = 0, offset = 0, arrLen = array.length; i < arrLen; i++) {
        target.set(array[i], offset)
        offset += array[i].length
    }

    return target
}

/**
 * Makes iterable with `value` repeated `n` times
 * @example
 * ```ts
 * const a = [...yieldNTimes(100, 3)]
 * // a = [100, 100, 100]
 * ```
 */
export function* yieldNTimes<T>(value: T, n: number): Generator<T, void> {
    let i = n
    while (i-- > 0) yield value
}

/**
 * Iterable lazy mapping
 * @example
 * ```ts
 * const a = [...yieldMapped([1, 2], x => x * 2)]
 * // a = [2, 4]
 * ```
 */
export function* yieldMapped<T, R>(items: Iterable<T>, mapFn: (item: T) => R): Generator<R, void> {
    for (const item of items) {
        yield mapFn(item)
    }
}

/**
 * Yield some iterable n times as a another iterable
 * @example
 * ```ts
 * const a = [...yieldCycleNTimes([0, 1], 3)]
 * // a = [0, 1, 0, 1, 0, 1]
 * ```
 */
export function* yieldCycleNTimes<T>(items: Iterable<T>, n: number): Generator<T, void> {
    let i = n
    while (i-- > 0) {
        for (const item of items) yield item
    }
}

/**
 * Returns value from `map` by `key` and throws if there is no such key
 */
export function mapGetUnwrap<K, V>(map: Map<K, V>, key: K): V {
    if (!map.has(key)) throw new Error(`failed to unwrap - key "${key}" not found`)
    return map.get(key)!
}

/**
 * Makes pretty-hex from bytes array, like `01 a5 f0`
 * @example
 * ```ts
 * hexifyBytes(new Uint8Array([1, 11, 3])) // '01 a1 03'
 * ```
 */
export function hexifyBytes(v: Uint8Array): string {
    return [...v].map((x) => x.toString(16).padStart(2, '0')).join(' ')
}

/**
 * Parses pretty space-separated hex into bytes
 * @param hex - Space-separated bytes in hex repr
 * @example
 * ```ts
 * prettyHexToBytes('01 02 03') // new Uint8Array([1, 2, 3])
 * ```
 */
export function prettyHexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(hex.split(' ').map((x) => parseInt(x, 16)))
}
