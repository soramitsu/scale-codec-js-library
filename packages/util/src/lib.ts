/**
 * @name assert
 * @summary Checks for a valid test, if not Error is thrown.
 * @description
 * Checks that `test` is a truthy value. If value is falsy (`null`, `undefined`, `false`, ...), it throws an Error with the supplied `message`. When `test` passes, `true` is returned.
 */
export function assert(condition: unknown, message: string | (() => string)): asserts condition {
    if (!condition) {
        throw new Error(typeof message === 'function' ? message() : message);
    }
}

/**
 * @summary Creates a concatenated Uint8Array from the inputs.
 * @description
 * Concatenates the input arrays into a single `UInt8Array`.
 */
export function concatUint8Arrays(iterable: Iterable<Uint8Array>): Uint8Array {
    const list = [...iterable];

    const length = list.reduce((l, arr) => l + arr.length, 0);
    const result = new Uint8Array(length);

    for (let i = 0, offset = 0; i < list.length; i++) {
        result.set(list[i], offset);
        offset += list[i].length;
    }

    return result;
}

export function* yieldNTimes<T>(item: T, n: number): Generator<T, void> {
    let i = n;
    while (i-- > 0) yield item;
}

export function* yieldMapped<T, R>(items: Iterable<T>, mapFn: (item: T) => R): Generator<R, void> {
    for (const item of items) {
        yield mapFn(item);
    }
}

export function* yieldCycleNTimes<T>(items: T[], n: number): Generator<T, void> {
    let i = n;
    while (i-- > 0) {
        for (const item of items) yield item;
    }
}

export function mapGetUnwrap<K, V>(map: Map<K, V>, key: K): V {
    if (!map.has(key)) throw new Error(`failed to unwrap - key "${key}" not found`);
    return map.get(key)!;
}
