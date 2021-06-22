import { concatUint8Arrays } from '@scale-codec/util';
import { Codec, DecodeResult } from '../types';

export class EnumInstance<V> {
    public static create<
        VStatic,
        K extends { [x in keyof VStatic]: VStatic[x] extends null ? x : never }[keyof VStatic],
    >(emptyVariant: K): EnumInstance<VStatic>;

    public static create<
        VStatic,
        K extends { [x in keyof VStatic]: VStatic[x] extends null ? never : x }[keyof VStatic],
    >(
        variantWithValue: K,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        value: VStatic[K],
    ): EnumInstance<VStatic>;

    public static create<VStatic>(variant: keyof VStatic, value?: any): EnumInstance<VStatic> {
        return new EnumInstance(variant, value ?? null);
    }

    public readonly variant: keyof V;

    public readonly value: unknown;

    private constructor(variantName: keyof V, value?: unknown) {
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

    public match<R = any>(matchMap: EnumMatchMap<V, R>): R {
        return matchMap[this.variant](this.value as any);
    }

    public toJSON() {
        return {
            variant: this.variant,
            value: this.value,
        };
    }
}

export type EnumMatchMap<V, R = any> = {
    [K in keyof V]: V[K] extends null ? () => R : (value: V[K]) => R;
};

export type EnumSchemaDef<V> = {
    [K in keyof V]: { discriminant: number };
};

export class EnumSchema<V> {
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
        this.createCodec = this.createCodec.bind(this);
        // this.create = this.create.bind(this);
    }

    public getVariantDiscriminant(variant: keyof V): number {
        return this.def[variant].discriminant;
    }

    public getDiscriminantVariant(discriminant: number): keyof V {
        return this.disVarMap[discriminant];
    }

    public createCodec(codecs: EnumCodecsMap<V>): EnumCodec<V> {
        return new EnumCodec(this, codecs);
    }
}

export type EnumNonEmptyVariants<V> = {
    [K in keyof V]: V[K] extends null ? never : K;
}[keyof V];

export type EnumCodecsMap<V> = {
    [K in EnumNonEmptyVariants<V>]: Codec<V[K]>;
};

export class EnumCodec<V> implements Codec<EnumInstance<V>> {
    private schema: EnumSchema<V>;
    private codecs: EnumCodecsMap<V>;

    public constructor(schema: EnumSchema<V>, codecs: EnumCodecsMap<V>) {
        this.schema = schema;
        this.codecs = codecs;
        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }

    public encode(val: EnumInstance<V>): Uint8Array {
        const { variant, value } = val;
        const discriminant = this.schema.getVariantDiscriminant(variant);
        const codec = this.codecByVariant(variant);

        const arrs: Uint8Array[] = [new Uint8Array([discriminant])];
        codec && arrs.push(codec.encode(value));

        return concatUint8Arrays(arrs);
    }

    public decode(bytes: Uint8Array): DecodeResult<EnumInstance<V>> {
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

        // unsafe `any` allowed here, i think
        return [EnumInstance.create(variant as any, value as any), len];
    }

    private codecByVariant(variant: keyof V): Codec<unknown> | null {
        return variant in this.codecs ? this.codecs[variant as keyof EnumCodecsMap<V>] : null;
    }
}
