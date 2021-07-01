import { assert } from '@scale-codec/util';
import { Enum, ValuableVariants, GetValuableVariantValue } from '@scale-codec/enum';
import JSBI from 'jsbi';
import { JsonValue, Serialize, Deserialize, Serde } from './types';

export function serBool(val: boolean): JsonValue {
    return val;
}

export function deBool(raw: JsonValue): boolean {
    assert(typeof raw === 'boolean', `"${raw}" is not a boolean`);
    return raw;
}

export const SerdeBool: Serde<boolean> = {
    ser: serBool,
    de: deBool,
};

export function serString(str: string): JsonValue {
    return str;
}

export function deString(raw: JsonValue): string {
    assert(typeof raw === 'string', `"${raw}" is not a string`);
    return raw;
}

export const SerdeString: Serde<string> = {
    ser: serString,
    de: deString,
};

const SerdeBigInt: Serde<JSBI> = {
    ser: (v) => v.toString(),
    de: (raw) => {
        assert(typeof raw === 'string' || typeof raw === 'number', `"${raw}" is not a string or number`);
        return JSBI.BigInt(raw);
    },
};

export function serVec<T>(vec: T[], serItem: Serialize<T>): JsonValue {
    return vec.map((x) => serItem(x));
}

export function deVec<T>(raw: JsonValue, deItem: Deserialize<T>): T[] {
    assert(Array.isArray(raw), `"${raw}" is not an array`);
    return raw.map((x) => deItem(x));
}

export function serdeVec<T>(serdeItem: Serde<T>): Serde<T[]> {
    return {
        ser: (v) => serVec(v, serdeItem.ser),
        de: (v) => deVec(v, serdeItem.de),
    };
}

export type StructSerializers<T> = { [K in keyof T]: Serialize<T[K]> };

export type StructDeserializers<T> = { [K in keyof T]: Deserialize<T[K]> };

export function serStruct<T extends { [x: string]: unknown }>(value: T, serializers: StructSerializers<T>): JsonValue {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serializers[k](v as any)]));
}

export function deStruct<T extends { [x: string]: unknown }>(raw: JsonValue, deserializers: StructDeserializers<T>): T {
    assert(typeof raw === 'object', `"${raw}" is not an object`);
    return Object.fromEntries(
        (Object.entries(deserializers) as [string, Deserialize<unknown>][]).map(([key, de]) => {
            return [key, de((raw as any)[key])];
        }),
    ) as T;
}

export function serMap<K, V>(map: Map<K, V>, serKey: Serialize<K>, serValue: Serialize<V>): JsonValue {
    return Array.from(map.entries(), ([key, value]) => [serKey(key), serValue(value)]);
}

export function deMap<K, V>(raw: JsonValue, deKey: Deserialize<K>, deValue: Deserialize<V>): Map<K, V> {
    assert(Array.isArray(raw), `"${raw}" is not an array`);

    return new Map(
        raw.map((item) => {
            assert(Array.isArray(item), `"${item}" is not an array`);
            assert(item.length === 2, `map entry must have 2 items`);

            const [key, value] = item;
            return [deKey(key), deValue(value)];
        }),
    );
}

export type EnumSerializers<Def> = { [V in ValuableVariants<Def>]: Serialize<GetValuableVariantValue<Def[V]>> };

export type EnumDeserializers<Def> = { [V in ValuableVariants<Def>]: Deserialize<GetValuableVariantValue<Def[V]>> };

export function serEnum<Def>(value: Enum<Def>, serializers: EnumSerializers<Def>): JsonValue {
    return {
        [value.variant]: value.content
            ? serializers[value.variant as ValuableVariants<Def>](value.content.value as any)
            : null,
    };
}

export function deEnum<Def>(raw: JsonValue, deserializers: EnumDeserializers<Def>): Enum<Def> {
    return Enum.create<{ poof: null }, 'poof'>('poof') as any;
}

export type TupleSerializers<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Serialize<Head>, ...TupleSerializers<Tail>]
    : [];

export function serTuple<Tuple extends any[]>(tuple: Tuple, serializers: TupleSerializers<Tuple>): JsonValue {
    return tuple.map((x, i) => (serializers[i] as any)(x));
}

export type TupleDeserializers<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Deserialize<Head>, ...TupleSerializers<Tail>]
    : [];

export function deTuple<Tuple extends any[]>(raw: JsonValue, deserializers: TupleDeserializers<Tuple>): Tuple {
    assert(Array.isArray(raw), `"${raw}" is not an array`);
    assert(raw.length === deserializers.length, `lengthes does not match`);
    return deserializers.map((de, i) => (de as any)(raw[i])) as Tuple;
}
