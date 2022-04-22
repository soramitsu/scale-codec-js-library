/**
 * Minimal tool to work with Rust's Enums.
 *
 * @packageDocumentation
 */

export type EnumGenericDef = string | [tag: string, value: any]

export type TagsEmpty<Def extends EnumGenericDef> = Def extends string ? Def : never

export type TagsValuable<Def extends EnumGenericDef> = Def extends [infer T, any] ? T & string : never

export type Tags<Def extends EnumGenericDef> = TagsEmpty<Def> | TagsValuable<Def>

export type TagValue<Def extends EnumGenericDef, T extends TagsValuable<Def>> = Def extends [T, infer V] ? V : never

export type EnumDef<E> = E extends Enum<infer Def> ? Def : never

export type EnumMatchMap<Def extends EnumGenericDef, R = any> = {
    [T in TagsEmpty<Def>]: () => R
} & {
    [T in TagsValuable<Def>]: (value: TagValue<Def, T>) => R
}

export type EnumDefToFactoryArgs<Def extends EnumGenericDef> =
    | [TagsEmpty<Def>]
    | (Def extends [string, any] ? Def : never)

/**
 * Special unique value to mark enum as empty
 */
export const ENUM_EMPTY_VALUE = Symbol('empty')

/**
 * Typed-wrapper to handle Rust's Enum concept.
 *
 * @remarks
 *
 * `Def` generic type is a **definition of enum variants**. It should be defined like this:
 *
 * ```ts
 * type MyDef = 'EmptyVariant' | ['VarWithBool', boolean]
 *
 * type MyEnum = Enum<MyDef>
 * ```
 *
 * Then you could create enums with that definition type-safely:
 *
 * ```ts
 * const val1: MyEnum = Enum.variant('EmptyVariant')
 * const val2: MyEnum = Enum.variant('VarWithBool', true)
 * ```
 */
export class Enum<Def extends EnumGenericDef> {
    public static variant<E extends Enum<any>>(...args: EnumDefToFactoryArgs<EnumDef<E>>): E
    public static variant<Def extends EnumGenericDef>(...args: EnumDefToFactoryArgs<Def>): Enum<Def>
    public static variant(tag: string, value = ENUM_EMPTY_VALUE) {
        return new Enum(tag, value)
    }

    public readonly tag: string

    /**
     * Inner value is untyped and should be used with caution
     */
    public readonly value: typeof ENUM_EMPTY_VALUE | unknown

    public constructor(tag: string, value: typeof ENUM_EMPTY_VALUE | unknown = ENUM_EMPTY_VALUE) {
        this.tag = tag
        this.value = value
    }

    public get isEmpty(): boolean {
        return this.value === ENUM_EMPTY_VALUE
    }

    /**
     * Check whether an enum instance has this variant name or not
     */
    public is(tag: Tags<Def>): boolean {
        return this.tag === tag
    }

    /**
     * Returns enum's content if **it exists** and **provided variant name matches with the enum's one**. If not, it
     * throws.
     *
     * @remarks
     * Use it in pair {@link Enum.is} to avoid runtime errors.
     */
    public as<T extends TagsValuable<Def>>(tag: T): TagValue<Def, T> {
        if (this.is(tag)) {
            if (this.isEmpty) {
                throw new Error(`Enum cast failed - enum "${tag}" is empty`)
            }

            return this.value as any
        }

        throw new Error(`Enum cast failed - enum is "${this.tag}", not "${tag}"`)
    }

    /**
     * Pretty simple alternative for 'pattern matching'
     *
     * @example
     *
     * ```ts
     * const file: Result<string, Error> = Enum.variant('Err', new Error('Oops!'))
     *
     * const fileContents = file.match({
     *     Ok: (txt) => txt,
     *     Err: (err) => {
     *         console.error(err)
     *         throw new Error('Bad file')
     *     }
     * })
     * ```
     */
    public match<R = any>(matchMap: EnumMatchMap<Def, R>): R {
        const fn = (matchMap as any)[this.tag] as (...args: any[]) => any
        return this.isEmpty ? fn() : fn(this.value)
    }

    public toJSON() {
        const { tag, value, isEmpty } = this
        return isEmpty ? { tag } : { tag, value }
    }
}

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString: Option<string> = Enum.variant('None')
 * ```
 */
export type Option<T> = Enum<'None' | ['Some', T]>

/**
 * Rust's `Result<O, E>` analog
 *
 * @example
 *
 * ```ts
 * const file: Result<string, Error> = Enum.variant('Ok', 'file contents')
 * ```
 */
export type Result<Ok, Err> = Enum<['Ok', Ok] | ['Err', Err]>
