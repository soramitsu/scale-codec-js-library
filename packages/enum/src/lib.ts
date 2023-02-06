/**
 * Tagged union in TypeScript.
 *
 * @packageDocumentation
 */

declare const enumTags: unique symbol

export type EnumRecord = Record<string, [] | [any]>

export interface Variant<in out E extends EnumRecord, Tag extends string, in out Content extends [] | [any] = []> {
  [enumTags]: E
  readonly tag: Tag
  readonly content: Content extends [infer C] ? C : undefined
  readonly unit: Content extends [] ? true : false
}

export type VariantAny = Variant<any, any, any>

export type Enumerate<E extends EnumRecord> = {
  [Tag in keyof E]: E[Tag] extends infer Content extends [] | [any] ? Variant<E, Tag & string, Content> : never
}[keyof E]

export type EnumOf<V extends VariantAny> = V extends Variant<infer E, any, any> ? E : never

export interface VariantFactoryFn {
  <V extends VariantAny>(...args: VariantToFactoryArgs<V>): V
  <E extends EnumRecord>(...args: VariantToFactoryArgs<Enumerate<E>>): Enumerate<E>
}

export type VariantToFactoryArgs<V extends VariantAny> = V extends Variant<any, infer Tag, infer Content>
  ? Content extends [infer C]
    ? [tag: Tag, content: C]
    : [tag: Tag]
  : never

export const variant: VariantFactoryFn = <V extends VariantAny>(...args: VariantToFactoryArgs<V>): V =>
  new (VariantImpl as any)(...args)

class VariantImpl {
  public readonly tag: string

  private readonly __c: null | [any]

  public constructor(...args: [string, any?]) {
    this.tag = args[0]
    this.__c = args.length > 1 ? [args[1]] : null
  }

  public get unit(): boolean {
    return !this.__c
  }

  public get content() {
    return this.__c?.[0] ?? undefined
  }

  public toJSON() {
    const { tag, content, unit } = this
    return unit ? { tag } : { tag, content }
  }
}

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString: RustOption<string> = variant('None')
 * ```
 */
export type RustOption<T> = Enumerate<{ None: []; Some: [T] }>

/**
 * Rust's `Result<Ok, Err>` analog
 *
 * @example
 *
 * ```ts
 * const file: RustResult<string, Error> = ('Ok', 'file contents')
 * ```
 */
export type RustResult<Ok, Err> = Enumerate<{ Ok: [Ok]; Err: [Err] }>
