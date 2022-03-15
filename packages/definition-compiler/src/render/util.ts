import { Seq } from 'immutable'
import { assert } from '@scale-codec/util'

export type ImportOptions = string | { source: string; as: string }

export function renderImports(imports: Iterable<ImportOptions>, moduleName: string, type = false): string {
    const joined = Seq(imports)
        .map((x) => (typeof x === 'string' ? x : `${x.source} as ${x.as}`))
        .sort()
        .join(', ')

    assert(joined, 'Empty imports are not allowed')

    return `import${type ? ' type' : ''} { ${joined} } from '${moduleName}'`
}

export interface DIScope<T> {
    provide: <R>(state: T, fn: () => R) => R
    inject: () => T
}

export function createDIScope<T>(): DIScope<T> {
    const stack: T[] = []

    return {
        provide: (value, fn) => {
            stack.push(value)
            const result = fn()
            stack.pop()
            return result
        },
        inject: () => {
            if (!stack.length) throw new Error('Call `use()` only inside of the `within()` callback')
            return stack[stack.length - 1]
        },
    }
}
