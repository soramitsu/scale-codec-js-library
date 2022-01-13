/**
 * Use it to define valuable variants for {@link Enum}
 */
export interface Valuable<T> {
    value: T
}

export type TagsEmpty<Def> = { [V in keyof Def & string]: Def[V] extends Valuable<any> ? never : V }[keyof Def & string]

export type TagsValuable<Def> = { [V in keyof Def & string]: Def[V] extends Valuable<any> ? V : never }[keyof Def &
    string]

export type GetValuableVariantValue<V extends Valuable<any>> = V extends Valuable<infer T> ? T : never

export type GetEnumDef<E extends Enum<any>> = E extends Enum<infer Def> ? Def : never

export type EnumMatchMap<V, R = any> = {
    [K in keyof V]: V[K] extends Valuable<infer T> ? (value: T) => R : () => R
}

/**
 * Typed-wrapper to handle Rust's Enum concept.
 *
 * @remarks
 *
 * `Def` generic type is a **definition of enum variants**. It should be defined like this:
 *
 * ```ts
 * type MyDef = {
 *     EmptyVariant: null // or undefined or anything else but not { value: T }
 *     VarWithBool: Valuable<boolean>
 * }
 *
 * type MyEnum = Enum<MyDef>
 * ```
 *
 * Then you could create enums with that definition type-safely:
 *
 * ```ts
 * const val1: MyEnum = Enum.empty('EmptyVariant')
 * const val2: MyEnum = Enum.valuable('VarWithBool', true)
 * ```
 *
 * Also look for {@link Valuable} helper
 */
export class Enum<Def> {
    /**
     * Create an empty variant of enum with it
     * @param tag - One of enum empty variants' tags
     */
    public static empty<Def>(tag: TagsEmpty<Def>): Enum<Def> {
        return new Enum(tag, null)
    }

    /**
     * Create a valuable variant of enum with it
     * @param tag - Valuable variant tag
     * @param value - Value associated with variant
     */
    public static valuable<Def, V extends TagsValuable<Def>>(
        tag: V,
        value: GetValuableVariantValue<Def[V]>,
    ): Enum<Def> {
        return new Enum(tag, [value])
    }

    public readonly tag: string

    /**
     * Inner value is untyped and should be used with caution
     */
    public readonly content: null | [some: unknown]

    private constructor(tag: string, content: null | [unknown]) {
        this.content = content ?? null
        this.tag = tag
    }

    /**
     * Check whether an enum instance has this variant name or not
     */
    public is<V extends keyof Def>(tag: V): boolean {
        return this.tag === tag
    }

    /**
     * Returns enum's content if **it exists** and **provided variant name matches with the enum's one**. If not, it
     * throws.
     *
     * @remarks
     * Use it in pair {@link Enum.is} to avoid runtime errors.
     */
    public as<V extends TagsValuable<Def>>(tag: V): Def[V] extends Valuable<infer T> ? T : never {
        if (this.is(tag)) {
            if (!this.content) {
                throw new Error(`Enum cast failed - enum "${tag}" is empty`)
            }

            return this.content[0] as any
        }

        throw new Error(`Enum cast failed - enum is "${this.tag}", not "${tag}"`)
    }

    /**
     * Pretty simple alternative for 'pattern matching'
     *
     * @example
     *
     * ```ts
     * const file: Result<string, Error> = Enum.valuable('Err', new Error('Oops!'))
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
        return this.content ? fn(this.content[0]) : fn()
    }

    /**
     * @internal
     */
    public toJSON() {
        const { tag, content } = this
        return content ? { tag, value: content[0] } : { tag }
    }
}
