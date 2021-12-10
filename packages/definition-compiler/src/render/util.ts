import { Seq } from 'immutable'
import { assert } from '@scale-codec/util'

export type ImportOptions = string | { source: string; as: string }

export function renderImports(imports: Iterable<ImportOptions>, moduleName: string): string {
    const joined = Seq(imports)
        .map((x) => (typeof x === 'string' ? x : `${x.source} as ${x.as}`))
        .sort()
        .join(', ')

    assert(joined, 'Empty imports are not allowed')

    return `import { ${joined} } from '${moduleName}'`
}

export interface StateScope<T> {
    within: <R>(state: T, fn: () => R) => R
    use: () => T
}

export function createStateScope<T>(): StateScope<T> {
    const stack: T[] = []

    return {
        within: (value, fn) => {
            stack.push(value)
            const result = fn()
            stack.pop()
            return result
        },
        use: () => {
            if (!stack.length) throw new Error('Call `use()` only inside of the `within()` callback')
            return stack[stack.length - 1]
        },
    }
}
