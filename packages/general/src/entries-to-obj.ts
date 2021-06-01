type ToEntries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T];

type Test = ToEntries<{ foo: string; bar: boolean }>;

type FromEntries<T extends [string, any]> = T extends [infer K, infer V] ? { [X in K & string]: V } : never;

type TestFrom = FromEntries<Test>;
