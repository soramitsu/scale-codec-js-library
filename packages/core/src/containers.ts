import JSBI from 'jsbi';
import { encodeBigIntCompact, retrieveOffsetAndEncodedLength } from './compact';
import { concatUint8Arrays, yieldMapped, yieldNTimes, mapGetUnwrap, yieldCycleNTimes } from '@scale-codec/util';
import { Decode, Encode, DecodeResult, Codec } from './types';

export function decodeIteratively<T>(bytes: Uint8Array, decoders: Iterable<Decode<T>>): DecodeResult<T[]> {
    const decoded: T[] = [];
    let totalDecodedBytes = 0;

    for (const decode of decoders) {
        const [item, decodedLen] = decode(bytes.subarray(totalDecodedBytes));
        decoded.push(item);
        totalDecodedBytes += decodedLen;
    }

    return [decoded, totalDecodedBytes];
}

export function decodeArrayContainer<T>(bytes: Uint8Array, arrayItemDecoder: Decode<T>): DecodeResult<T[]> {
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
    decoders: Iterable<Decode<T extends (infer V)[] ? V : never>>,
): DecodeResult<T> {
    return decodeIteratively(bytes, decoders) as any;
}

export function encodeTuple<T extends any[]>(
    tuple: T,
    encoders: Iterable<Encode<T extends (infer V)[] ? V : never>>,
): Uint8Array {
    function* parts(): Generator<Uint8Array> {
        let i = 0;
        for (const encode of encoders) {
            yield encode(tuple[i++]);
        }
    }

    return concatUint8Arrays(parts());
}

export function encodeStruct<T extends {}, C extends { [K in keyof T & string]: Encode<T[K]> }>(
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

export function decodeStruct<T extends {}, C extends { [K in keyof T & string]: Decode<T[K]> }>(
    bytes: Uint8Array,
    decoders: C,
    order: (keyof T & string)[],
): DecodeResult<T> {
    function* decodersIter(): Generator<Decode<unknown>> {
        for (const field of order) {
            yield decoders[field];
        }
    }

    const [values, len] = decodeIteratively(bytes, decodersIter());

    return [Object.fromEntries(order.map((key, i) => [key, values[i]])) as T, len];
}

export class RawEnum<V> {
    // public readonly discriminant: number;

    public readonly variant: keyof V;

    public readonly value: unknown;

    // private readonly schema: RawEnumSchema<V>;

    public constructor(variantName: keyof V, value?: unknown) {
        // this.schema = schema;
        // this.discriminant = discriminant;
        this.value = value;
        this.variant = variantName;
    }

    public is<K extends keyof V>(variant: K): boolean {
        return this.variant === variant;
    }

    public as<K extends { [x in keyof V]: V[x] extends null ? never : x }[keyof V]>(variant: K): V[K] {
        if (this.is(variant)) {
            return this.value as V[K];
        }

        throw new Error(`cast failed - enum is not the "${variant}"`);
    }

    // public encode(): Uint8Array {
    //     const encode = this.schema.getEncoderFor(this.discriminant);

    //     const arrs: Uint8Array[] = [new Uint8Array([this.discriminant])];
    //     encode && arrs.push(encode(this.value));

    //     return concatUint8Arrays(arrs);
    // }

    public match<R = any>(matchMap: RawEnumMatchMap<V, R>): R {
        return matchMap[this.variant](this.value as any);
    }

    // public toString(): string {
    //     return `${this.variantName}${this.value ? `(${String(this.value)})` : ''}`;
    // }

    public toJSON() {
        return {
            variant: this.variant,
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

export type RawEnumSchemaEntry<T> = RawEnumSchemaEntryEmpty | RawEnumSchemaEntryValued<T>;

export interface RawEnumSchemaEntryEmpty {
    discriminant: number;
}

export type RawEnumSchemaEntryValued<T> = RawEnumSchemaEntryEmpty & Codec<T>;

export type EnumSchemaDef<V> = {
    [K in keyof V]: { discriminant: number };
};

export class RawEnumSchema<V> {
    private readonly def: EnumSchemaDef<V>;

    private readonly disVarMap: Record<number, keyof V>;

    public constructor(def: EnumSchemaDef<V>) {
        this.def = def;
        this.disVarMap = Object.fromEntries(
            (Object.entries(def) as [keyof V, { discriminant: number }][]).map(([variant, { discriminant }]) => [
                discriminant,
                variant,
            ]),
        );

        this.getVariantDiscriminant = this.getVariantDiscriminant.bind(this);
        this.getDiscriminantVariant = this.getDiscriminantVariant.bind(this);
        this.enumCodec = this.enumCodec.bind(this);
        this.create = this.create.bind(this);
    }

    public getVariantDiscriminant(variant: keyof V): number {
        return this.def[variant].discriminant;
    }

    public getDiscriminantVariant(discriminant: number): keyof V {
        return this.disVarMap[discriminant];
    }

    public enumCodec(codecs: EnumCodecs<V>): RawEnumCodec<V> {
        return new RawEnumCodec(this, codecs);
    }

    // public genVariantNameFor(discriminant: number): keyof V {
    //     return mapGetUnwrap(this.disMap, discriminant);
    // }

    // public getDecoderFor(discriminant: number): Decode<unknown> | null {
    //     const variant = this.genVariantNameFor(discriminant);
    //     return (this.schema[variant] as any).decoder;
    // }

    // public getEncoderFor(discriminant: number): Encode<unknown> | null {
    //     const variant = this.genVariantNameFor(discriminant);
    //     return (this.schema[variant] as any).encoder;
    // }

    // public isNameMatchesDiscriminant<K extends keyof V>(name: K, discriminant: number): boolean {
    //     return name === this.genVariantNameFor(discriminant);
    // }

    // public decode(bytes: Uint8Array): DecodeResult<RawEnum<V>> {
    //     const discriminant = bytes[0];
    //     const decode = this.getDecoderFor(discriminant);
    //     let len = 1;
    //     let value: unknown = null;

    //     if (decode) {
    //         const [decoded, decodedLen] = decode(bytes.subarray(1));
    //         len += decodedLen;
    //         value = decoded;
    //     }

    //     return [new RawEnum(this, discriminant, value), len];
    // }

    public create<K extends { [x in keyof V]: V[x] extends null ? x : never }[keyof V]>(emptyVariant: K): RawEnum<V>;
    public create<K extends { [x in keyof V]: V[x] extends null ? never : x }[keyof V]>(
        variantWithValue: K,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        value: V[K],
    ): RawEnum<V>;

    public create(variant: keyof V, value?: any): RawEnum<V> {
        return new RawEnum(variant, value ?? null);
    }
}

export type EnumNonEmptyVariants<V> = {
    [K in keyof V]: V[K] extends null ? never : K;
}[keyof V];

export type EnumCodecs<V> = {
    [K in EnumNonEmptyVariants<V>]: Codec<V[K]>;
};

// type AAA = EnumCodecs<{
//     None: null;
//     Some: boolean;
// }>;

// type CodecsForEnumValues<V> = {
//     [K in keyof V]: DisMaybeWithCodec<V[K]>;
// };

// type DisMaybeWithCodec<V> = V extends null
//     ? {
//           dis: number;
//       }
//     : {
//           dis: number;
//           codec: Codec<V>;
//       };

export class RawEnumCodec<V> implements Codec<RawEnum<V>> {
    private schema: RawEnumSchema<V>;
    private codecs: EnumCodecs<V>;

    public constructor(schema: RawEnumSchema<V>, codecs: EnumCodecs<V>) {
        this.schema = schema;
        this.codecs = codecs;
        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }

    public encode(val: RawEnum<V>): Uint8Array {
        const { variant, value } = val;
        const discriminant = this.schema.getVariantDiscriminant(variant);
        const codec = this.codecByVariant(variant);

        const arrs: Uint8Array[] = [new Uint8Array([discriminant])];
        codec && arrs.push(codec.encode(value));

        return concatUint8Arrays(arrs);
    }

    public decode(bytes: Uint8Array): DecodeResult<RawEnum<V>> {
        const discriminant = bytes[0];
        const variant = this.schema.getDiscriminantVariant(discriminant);
        const codec = this.codecByVariant(variant);

        let len = 1;
        let value: unknown = null;

        if (codec) {
            const [decoded, decodedLen] = codec.decode(bytes.subarray(1));
            len += decodedLen;
            value = decoded;
        }

        return [new RawEnum(variant, value), len];
    }

    private codecByVariant(variant: keyof V): Codec<unknown> | null {
        return variant in this.codecs ? this.codecs[variant as keyof EnumCodecs<V>] : null;
    }
}

export function encodeMap<K, V>(map: Map<K, V>, KeyEncoder: Encode<K>, ValueEncoder: Encode<V>): Uint8Array {
    const parts = [encodeBigIntCompact(JSBI.BigInt(map.size))];

    for (const [key, value] of map.entries()) {
        parts.push(KeyEncoder(key), ValueEncoder(value));
    }

    return concatUint8Arrays(parts);
}

export function decodeMap<K, V>(
    bytes: Uint8Array,
    KeyDecoder: Decode<K>,
    ValueDecoder: Decode<V>,
): DecodeResult<Map<K, V>> {
    const [offset, length] = retrieveOffsetAndEncodedLength(bytes);

    const decoders = yieldCycleNTimes<Decode<K | V>>([KeyDecoder, ValueDecoder], JSBI.toNumber(length));
    const [decodedKeyValuesSequence, kvDecodedBytes] = decodeIteratively(bytes.subarray(offset), decoders);

    const totalDecodedBytes = offset + kvDecodedBytes;
    const map = new Map<K, V>();

    for (let i = 0; i < decodedKeyValuesSequence.length; i += 2) {
        map.set(decodedKeyValuesSequence[i] as K, decodedKeyValuesSequence[i + 1] as V);
    }

    return [map, totalDecodedBytes];
}
