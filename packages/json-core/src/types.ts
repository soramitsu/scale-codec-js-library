export type JsonValue = null | string | boolean | number | { [K in string]: JsonValue } | JsonValue[];

export type Serialize<T> = (value: T) => JsonValue;

export type Deserialize<T> = (raw: JsonValue) => T;

export interface Serde<T> {
    ser: Serialize<T>;
    de: Deserialize<T>;
}
