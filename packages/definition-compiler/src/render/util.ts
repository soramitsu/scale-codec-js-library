import { Seq } from 'immutable'
import { assert } from '@scale-codec/util'

export const INDENTATION = ' '.repeat(4)

export type ImportOptions = string | { source: string; as: string }

export function renderImports(
  imports: Iterable<ImportOptions>,
  moduleName: string,
  options?: {
    type?: boolean
  },
): string {
  const joined = Seq(imports)
    .map((x) => (typeof x === 'string' ? x : `${x.source} as ${x.as}`))
    .sort()
    .join(',\n' + INDENTATION)

  assert(joined, 'Empty imports are not allowed')

  return `import${options?.type ? ' type' : ''} {\n${INDENTATION}${joined}\n} from '${moduleName}'`
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
