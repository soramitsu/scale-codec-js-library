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

export class Enum<Def> {
    public static create<Def, V extends EmptyVariants<Def>>(variant: V): Enum<Def>;

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

    public readonly content: null | { value: unknown };

    private constructor(variant: keyof Def, content?: { value: unknown }) {
        this.content = content ?? null;
        this.variant = variant;
    }

    public is<V extends keyof Def>(variant: V): boolean {
        return this.variant === variant;
    }

    public as<V extends ValuableVariants<Def>>(variant: V): Def[V] extends Valuable<infer T> ? T : never {
        if (this.is(variant) && this.content) {
            return this.content.value as Def[V];
        }

        throw new Error(`cast failed - enum is not the "${variant}"`);
    }

    public match<R = any>(matchMap: EnumMatchMap<Def, R>): R {
        const fn = matchMap[this.variant] as (...args: any[]) => any;
        return this.content ? fn(this.content.value) : fn();
    }

    public toJSON() {
        const { variant, content } = this;
        return content ? { variant, value: content.value } : { variant };
    }
}
