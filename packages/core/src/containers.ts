import JSBI from 'jsbi';
import { encodeBigIntCompact, retrieveOffsetAndEncodedLength } from './compact';
import { concatUint8Arrays, yieldMapped, yieldNTimes, mapGetUnwrap, yieldCycleNTimes } from '@scale-codec/util';
import { Decoder, Encoder, DecodeResult } from './types';

export function decodeIteratively<T>(bytes: Uint8Array, decoders: Iterable<Decoder<T>>): DecodeResult<T[]> {
    const decoded: T[] = [];
    let totalDecodedBytes = 0;

    for (const decode of decoders) {
        const [item, decodedLen] = decode(bytes.subarray(totalDecodedBytes));
        decoded.push(item);
        totalDecodedBytes += decodedLen;
    }

    return [decoded, totalDecodedBytes];
}

export function decodeArrayContainer<T>(bytes: Uint8Array, arrayItemDecoder: Decoder<T>): DecodeResult<T[]> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);
    const iterableDecoders = yieldNTimes(arrayItemDecoder, JSBI.toNumber(length));

    const [decoded, decodedBytes] = decodeIteratively(bytes.subarray(offset), iterableDecoders);

    return [decoded, offset + decodedBytes];
}

export function encodeArrayContainer<T>(items: T[], encoder: (item: T) => Uint8Array): Uint8Array {
    return concatUint8Arrays([encodeBigIntCompact(JSBI.BigInt(items.length)), ...yieldMapped(items, encoder)]);
}

export function decodeTuple<T extends any[]>(
    bytes: Uint8Array,
    decoders: Iterable<Decoder<T extends (infer V)[] ? V : never>>,
): DecodeResult<T> {
    return decodeIteratively(bytes, decoders) as any;
}

export function encodeTuple<T extends any[]>(
    tuple: T,
    encoders: Iterable<Encoder<T extends (infer V)[] ? V : never>>,
): Uint8Array {
    function* parts(): Generator<Uint8Array> {
        let i = 0;
        for (const encode of encoders) {
            yield encode(tuple[i++]);
        }
    }

    return concatUint8Arrays(parts());
}

export function encodeStruct<T extends {}, C extends { [K in keyof T & string]: Encoder<T[K]> }>(
    struct: T,
    encoders: C,
    order: (keyof T & string)[],
): Uint8Array {
    function* parts(): Generator<Uint8Array> {
        for (const field of order) {
            const encoded = encoders[field](struct[field]);
            yield encoded;
        }
    }

    return concatUint8Arrays(parts());
}

export function decodeStruct<T extends {}, C extends { [K in keyof T & string]: Decoder<T[K]> }>(
    bytes: Uint8Array,
    decoders: C,
    order: (keyof T & string)[],
): DecodeResult<T> {
    function* decodersIter(): Generator<Decoder<unknown>> {
        for (const field of order) {
            yield decoders[field];
        }
    }

    const [values, len] = decodeIteratively(bytes, decodersIter());

    return [Object.fromEntries(order.map((key, i) => [key, values[i]])) as T, len];
}

export class RawEnum<V> {
    public readonly discriminant: number;

    public readonly variantName: keyof V;

    private readonly schema: RawEnumSchema<V>;

    private readonly value: unknown;

    public constructor(schema: RawEnumSchema<V>, discriminant: number, value?: unknown) {
        this.schema = schema;
        this.discriminant = discriminant;
        this.value = value;
        this.variantName = schema.genVariantNameFor(discriminant);
    }

    public is<K extends keyof V>(variant: K): boolean {
        return this.schema.isNameMatchesDiscriminant(variant, this.discriminant);
    }

    public as<K extends { [x in keyof V]: V[x] extends null ? never : x }[keyof V]>(variant: K): V[K] {
        if (this.is(variant)) {
            return this.value as V[K];
        }

        throw new Error(`cast failed - enum is not the "${variant}"`);
    }

    public encode(): Uint8Array {
        const encode = this.schema.getEncoderFor(this.discriminant);

        const arrs: Uint8Array[] = [new Uint8Array([this.discriminant])];
        encode && arrs.push(encode(this.value));

        return concatUint8Arrays(arrs);
    }

    public match<R = any>(matchMap: RawEnumMatchMap<V, R>): R {
        return matchMap[this.variantName](this.value as any);
    }

    // public toString(): string {
    //     return `${this.variantName}${this.value ? `(${String(this.value)})` : ''}`;
    // }

    public toJSON() {
        return {
            discriminant: this.discriminant,
            value: this.value,
        };
    }

    // public eq(other: RawEnum<V>): boolean {
    //     return this.discriminant === other.discriminant;
    // }
}

export type RawEnumMatchMap<V, R = any> = {
    [K in keyof V]: V[K] extends null ? () => R : (value: V[K]) => R;
};

export type RawEnumSchemaEntry<T> = {
    discriminant: number;
} & (T extends null ? {} : { encoder: Encoder<T>; decoder: Decoder<T> });

export type RawEnumSchemaData<V> = {
    [K in keyof V]: RawEnumSchemaEntry<V[K]>;
};

export class RawEnumSchema<
    V,
    // S extends RawEnumSchemaData<V> = RawEnumSchemaData<V>,
> {
    private readonly schema: RawEnumSchemaData<V>;

    private readonly disMap: Map<number, keyof V>;

    public constructor(schema: RawEnumSchemaData<V>) {
        this.schema = schema;
        this.disMap = new Map(
            (Object.entries(schema) as [keyof V, RawEnumSchemaEntry<unknown>][]).map(([key, { discriminant }]) => [
                discriminant,
                key,
            ]),
        );
    }

    public genVariantNameFor(discriminant: number): keyof V {
        return mapGetUnwrap(this.disMap, discriminant);
    }

    public getDecoderFor(discriminant: number): Decoder<unknown> | null {
        const variant = this.genVariantNameFor(discriminant);
        return (this.schema[variant] as any).decoder;
    }

    public getEncoderFor(discriminant: number): Encoder<unknown> | null {
        const variant = this.genVariantNameFor(discriminant);
        return (this.schema[variant] as any).encoder;
    }

    public isNameMatchesDiscriminant<K extends keyof V>(name: K, discriminant: number): boolean {
        return name === this.genVariantNameFor(discriminant);
    }

    public decode(bytes: Uint8Array): DecodeResult<RawEnum<V>> {
        const discriminant = bytes[0];
        const decode = this.getDecoderFor(discriminant);
        let len = 1;
        let value: unknown = null;

        if (decode) {
            const [decoded, decodedLen] = decode(bytes.subarray(1));
            len += decodedLen;
            value = decoded;
        }

        return [new RawEnum(this, discriminant, value), len];
    }

    public create<K extends { [x in keyof V]: V[x] extends null ? x : never }[keyof V]>(emptyVariant: K): RawEnum<V>;
    public create<K extends { [x in keyof V]: V[x] extends null ? never : x }[keyof V]>(
        variantWithValue: K,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        value: V[K],
    ): RawEnum<V>;

    public create(variant: keyof V, value?: any): RawEnum<V> {
        return new RawEnum(this, this.schema[variant].discriminant, value ?? null);
    }
}

export function encodeMap<K, V>(map: Map<K, V>, KeyEncoder: Encoder<K>, ValueEncoder: Encoder<V>): Uint8Array {
    const parts = [encodeBigIntCompact(JSBI.BigInt(map.size))];

    for (const [key, value] of map.entries()) {
        parts.push(KeyEncoder(key), ValueEncoder(value));
    }

    return concatUint8Arrays(parts);
}

export function decodeMap<K, V>(
    bytes: Uint8Array,
    KeyDecoder: Decoder<K>,
    ValueDecoder: Decoder<V>,
): DecodeResult<Map<K, V>> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);

    const decoders = yieldCycleNTimes<Decoder<K | V>>([KeyDecoder, ValueDecoder], JSBI.toNumber(length));
    const [decodedKeyValuesSequence, kvDecodedBytes] = decodeIteratively(bytes.subarray(offset), decoders);

    const totalDecodedBytes = offset + kvDecodedBytes;
    const map = new Map<K, V>();

    for (let i = 0; i < decodedKeyValuesSequence.length; i += 2) {
        map.set(decodedKeyValuesSequence[i] as K, decodedKeyValuesSequence[i + 1] as V);
    }

    return [map, totalDecodedBytes];
}
