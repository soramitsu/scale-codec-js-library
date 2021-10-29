/**
 * Use it to define valuable variants for {@link Enum}
 */
export interface Valuable<T> {
    value: T;
}

export type EmptyVariants<Def> = { [V in keyof Def]: Def[V] extends Valuable<any> ? never : V }[keyof Def];

export type ValuableVariants<Def> = { [V in keyof Def]: Def[V] extends Valuable<any> ? V : never }[keyof Def];

export type GetValuableVariantValue<V extends Valuable<any>> = V extends Valuable<infer T> ? T : never;

export type GetEnumDef<E extends Enum<any>> = E extends Enum<infer Def> ? Def : never;

export type EnumMatchMap<V, R = any> = {
    [K in keyof V]: V[K] extends Valuable<infer T> ? (value: T) => R : () => R;
};

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
 * const a: MyEnum = Enum.create('EmptyVariant')
 * ```
 *
 * Also look for {@link Valuable} helper
 */
export class Enum<Def> {
    /**
     * Create an empty variant of enum with it
     * @param variant - Empty variant name
     */
    public static create<Def, V extends EmptyVariants<Def>>(variant: V): Enum<Def>;

    /**
     * Create a valuable variant of enum with it
     * @param variant - Valuable variant name
     * @param value - Value associated with variant
     */
    public static create<Def, V extends ValuableVariants<Def>>(
        variant: V,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        value: GetValuableVariantValue<Def[V]>,
    ): Enum<Def>;

    public static create<Def, V extends keyof Def>(
        variant: V,
        value?: Def[V] extends Valuable<infer T> ? T : undefined,
    ): Enum<Def> {
        return new Enum(
            variant,
            // so... we do not accept `undefined` as inner values, yes
            value === undefined ? undefined : { value },
        );
    }

    public readonly variant: keyof Def;

    /**
     * Inner value is untyped and should be used with caution
     */
    public readonly content: null | { value: unknown };

    private constructor(variant: keyof Def, content?: { value: unknown }) {
        this.content = content ?? null;
        this.variant = variant;
    }

    /**
     * Check whether an enum instance has this variant name or not
     */
    public is<V extends keyof Def>(variant: V): boolean {
        return this.variant === variant;
    }

    /**
     * Returns enum's content if **it exists** and **provided variant name matches with the enum's one**. If not, it
     * throws.
     *
     * @remarks
     * Use it in pair {@link Enum.is} to avoid runtime errors.
     */
    public as<V extends ValuableVariants<Def>>(variant: V): Def[V] extends Valuable<infer T> ? T : never {
        if (this.is(variant) && this.content) {
            return this.content.value as Def[V];
        }

        throw new Error(`cast failed - enum is not the "${variant}"`);
    }

    /**
     * Pretty simple alternative for 'pattern matching'
     *
     * @example
     *
     * ```ts
     * const file: Result<string, Error> = Enum.create('Err', new Error('Oops!'))
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
        const fn = matchMap[this.variant] as (...args: any[]) => any;
        return this.content ? fn(this.content.value) : fn();
    }

    /**
     * @internal
     */
    public toJSON() {
        const { variant, content } = this;
        return content ? { variant, value: content.value } : { variant };
    }
}
