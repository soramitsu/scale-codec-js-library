## API Report File for "@scale-codec/enum"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public
export class Enum<Def extends EnumGenericDef> {
    constructor(tag: string, value?: typeof ENUM_EMPTY_VALUE | unknown);
    as<T extends TagsValuable<Def>>(tag: T): TagValue<Def, T>;
    is(tag: Tags<Def>): boolean;
    // (undocumented)
    get isEmpty(): boolean;
    match<R = any>(matchMap: EnumMatchMap<Def, R>): R;
    // (undocumented)
    readonly tag: string;
    // (undocumented)
    toJSON(): {
        tag: string;
        value?: undefined;
    } | {
        tag: string;
        value: unknown;
    };
    readonly value: typeof ENUM_EMPTY_VALUE | unknown;
    // (undocumented)
    static variant<E extends Enum<any>>(...args: EnumDefToFactoryArgs<EnumDef<E>>): E;
    // (undocumented)
    static variant<Def extends EnumGenericDef>(...args: EnumDefToFactoryArgs<Def>): Enum<Def>;
}

// @public
export const ENUM_EMPTY_VALUE: unique symbol;

// @public (undocumented)
export type EnumDef<E> = E extends Enum<infer Def> ? Def : never;

// @public (undocumented)
export type EnumDefToFactoryArgs<Def extends EnumGenericDef> = [TagsEmpty<Def>] | (Def extends [string, any] ? Def : never);

// @public
export type EnumGenericDef = string | [tag: string, value: any];

// @public (undocumented)
export type EnumMatchMap<Def extends EnumGenericDef, R = any> = {
    [T in TagsEmpty<Def>]: () => R;
} & {
    [T in TagsValuable<Def>]: (value: TagValue<Def, T>) => R;
};

// @public
type Option_2<T> = Enum<'None' | ['Some', T]>;
export { Option_2 as Option }

// @public
export type Result<Ok, Err> = Enum<['Ok', Ok] | ['Err', Err]>;

// @public (undocumented)
export type Tags<Def extends EnumGenericDef> = TagsEmpty<Def> | TagsValuable<Def>;

// @public (undocumented)
export type TagsEmpty<Def extends EnumGenericDef> = Def extends string ? Def : never;

// @public (undocumented)
export type TagsValuable<Def extends EnumGenericDef> = Def extends [infer T, any] ? T & string : never;

// @public (undocumented)
export type TagValue<Def extends EnumGenericDef, T extends TagsValuable<Def>> = Def extends [T, infer V] ? V : never;

```
