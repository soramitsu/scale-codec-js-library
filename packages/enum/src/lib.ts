/**
 * Heterogeneous disjoint union type in TypeScript.
 *
 * Other names:
 *
 * - Algebraic enum
 * - Tagged union
 * - "Enums like in Rust"
 *
 * @packageDocumentation
 */

export class Variant<T extends string, in out V = typeof EMPTY_VALUE> {
  public readonly tag: T
  public readonly value: V

  public constructor(tag: T, value: V) {
    this.tag = tag
    this.value = value
  }

  public toJSON() {
    const { tag, value } = this
    if ((value as any) === EMPTY_VALUE) {
      return { tag }
    }
    return { tag, value }
  }
}

export type VariantFactoryArgs<V extends Variant<any, any>> = V extends Variant<infer Tag, infer Value>
  ? Value extends typeof EMPTY_VALUE
    ? [Tag]
    : [Tag, Value]
  : never

function variant<V extends Variant<any, any>>(...args: VariantFactoryArgs<V>): V
function variant(tag: string, value: any = EMPTY_VALUE): Variant<any, any> {
  return new Variant(tag, value)
}

export { variant }

export const EMPTY_VALUE = Symbol('empty')

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString = variant<Option<string>>('None')
 * ```
 *
 * TODO use in-out?
 */
export type Option<T> = Variant<'None'> | Variant<'Some', T>

/**
 * Rust's `Result<O, E>` analog
 *
 * @example
 *
 * ```ts
 * const file = variant<Result<string, Error>>('Ok', 'file contents')
 * ```
 */
export type Result<Ok, Err> = Variant<'Ok', Ok> | Variant<'Err', Err>
