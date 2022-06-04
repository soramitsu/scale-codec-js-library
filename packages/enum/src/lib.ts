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

export const EMPTY_VALUE = Symbol('empty')

export type EmptyValue = typeof EMPTY_VALUE

export function isEmpty(value: any): value is EmptyValue {
  return value === EMPTY_VALUE
}

export type AnyVariant = Variant<any>

export type AnyVariantShape = string | [string, any]

export type VariantTag<V extends AnyVariant> = V extends Variant<infer T> ? VariantShapeTag<T> : never

export type VariantValue<V extends AnyVariant> = V extends Variant<infer T> ? VariantShapeValue<T> : never

export type VariantShapeTag<T extends AnyVariantShape> = T extends infer Tag extends string
  ? Tag
  : T extends [infer Tag extends string, any]
  ? Tag
  : never

export type VariantShapeValue<T extends AnyVariantShape> = T extends [string, infer Value] ? Value : EmptyValue

export class Variant<in out T extends AnyVariantShape> {
  public readonly tag: VariantShapeTag<T>
  public readonly value: VariantShapeValue<T>

  public constructor(tag: VariantTag<Variant<T>>, value: VariantValue<Variant<T>>) {
    this.tag = tag
    this.value = value
  }

  public get isEmpty(): boolean {
    return isEmpty(this.value)
  }

  public toJSON() {
    const { tag, value } = this
    if (isEmpty(value)) {
      return { tag }
    }
    return { tag, value }
  }
}

export type VariantFactoryArgs<V extends AnyVariant> = V extends Variant<infer V>
  ? V extends infer Tag extends string
    ? [Tag]
    : V extends [infer Tag extends string, infer Value]
    ? [Tag, Value]
    : never
  : never

export type VariantFactory = <V extends AnyVariant>(...args: VariantFactoryArgs<V>) => V

export const variant: VariantFactory = ((tag: string, value: any = EMPTY_VALUE): AnyVariant => {
  return new Variant(tag, value)
}) as VariantFactory

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
export type Option<T> = Variant<'None'> | Variant<['Some', T]>

/**
 * Rust's `Result<O, E>` analog
 *
 * @example
 *
 * ```ts
 * const file = variant<Result<string, Error>>('Ok', 'file contents')
 * ```
 */
export type Result<Ok, Err> = Variant<['Ok', Ok]> | Variant<['Err', Err]>
