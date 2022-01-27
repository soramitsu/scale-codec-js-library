export type DefGeneral = string | [tag: string, value: any]

export type TagsEmpty<Def extends DefGeneral> = Def extends string ? Def : never

export type TagsValuable<Def extends DefGeneral> = Def extends [infer T, any] ? T & string : never

export type Tags<Def extends DefGeneral> = TagsEmpty<Def> | TagsValuable<Def>

export type TagValue<Def extends DefGeneral, T extends TagsValuable<Def>> = Def extends [T, infer V] ? V : never

export type EnumDef<E extends Enum<any>> = E extends Enum<infer Def> ? Def : never

export type EnumMatchMap<Def extends DefGeneral, R = any> = {
    [T in TagsEmpty<Def>]: () => R
} & {
    [T in TagsValuable<Def>]: (value: TagValue<Def, T>) => R
}

export type EnumDefToFactoryArgs<Def extends DefGeneral> = [TagsEmpty<Def>] | (Def extends [string, any] ? Def : never)

// {
//     class NewEnum<Def extends DefGeneral> {
//         public static create<D extends DefGeneral>(): EnumVariantsFactory<D> {}
//     }

//     type EnumVariantsFactory<Def extends DefGeneral> = {
//         [T in TagsEmpty<Def>]: () => Enum<Def>
//     } & {
//         [T in TagsValuable<Def>]: (value: TagValue<Def, T>) => Enum<Def>
//     }

//     type OptDef<T> = 'None' | ['Some', T]
//     type OptionBool = Enum<OptDef<boolean>>

//     const val1: OptionBool = NewEnum.create().None()
//     const val2: OptionBool = NewEnum.create().Some(false)

//     type EnumDefToArgs<Def extends DefGeneral> = [TagsEmpty<Def>] | (Def extends [string, any] ? Def : never)

//     // eslint-disable-next-line no-inner-declarations
//     function enumFactory<E extends Enum<any>>(...args: EnumDefToArgs<EnumDef<E>>): E {
//         return null
//     }

//     const val3: OptionBool = enumFactory('Some', false)

//     // eslint-disable-next-line no-inner-declarations
//     function enumFactory2<E extends Enum<any>>(tagOrTuple: EnumDef<E>): E {
//         return null
//     }

//     const val4: OptionBool = enumFactory2(['Some', false])
// }

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
export class Enum<Def extends DefGeneral> {
    // /**
    //  * Create an empty variant of enum with it
    //  * @param tag - One of enum empty variants' tags
    //  */
    // public static empty<Def extends DefGeneral>(tag: TagsEmpty<Def>): Enum<Def> {
    //     return new Enum(tag, ENUM_EMPTY_VALUE)
    // }

    // /**
    //  * Create a valuable variant of enum with it
    //  * @param tag - Valuable variant tag
    //  * @param value - Value associated with variant
    //  */
    // public static valuable<Def extends DefGeneral, T extends TagsValuable<Def>, V extends TagValue<Def, T>>(
    //     tag: T,
    //     value: V,
    // ): Enum<Def> {
    //     return new Enum(tag, value)
    // }

    // public static variant<Def extends DefGeneral>(
    //     ...args: Def extends [infer T, infer V] ? [T, V] : [tag: Def]
    // ): Enum<Def> {
    //     return null
    // }

    public static variant<E extends Enum<any>>(...args: EnumDefToFactoryArgs<EnumDef<E>>): E
    public static variant(tag: string, value = ENUM_EMPTY_VALUE) {
        return new Enum(tag, value)
    }

    public readonly tag: string

    /**
     * Inner value is untyped and should be used with caution
     */
    public readonly value: typeof ENUM_EMPTY_VALUE | unknown

    private constructor(tag: string, value: typeof ENUM_EMPTY_VALUE | unknown = ENUM_EMPTY_VALUE) {
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
    public as<T extends TagsValuable<Def>>(tag: T): TagValue<DefGeneral, T> {
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
        return this.isEmpty ? fn() : fn(this.value)
    }

    public toJSON() {
        const { tag, value, isEmpty } = this
        return isEmpty ? { tag } : { tag, value }
    }
}
