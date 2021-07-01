import { concatUint8Arrays } from '@scale-codec/util';
import { EmptyVariants, Enum, Valuable, ValuableVariants } from '@scale-codec/enum';
import { Codec, DecodeResult } from '../types';

export type EnumSchemaDef<Def> = {
    [K in keyof Def]: { discriminant: number };
};

export class EnumSchema<Def> {
    private readonly def: EnumSchemaDef<Def>;

    private readonly disVarMap: Record<number, keyof Def>;

    public constructor(def: EnumSchemaDef<Def>) {
        this.def = def;
        this.disVarMap = Object.fromEntries(
            (Object.entries(def) as [keyof Def, { discriminant: number }][]).map(([variant, { discriminant }]) => [
                discriminant,
                variant,
            ]),
        );

        this.getVariantDiscriminant = this.getVariantDiscriminant.bind(this);
        this.getDiscriminantVariant = this.getDiscriminantVariant.bind(this);
        this.createCodec = this.createCodec.bind(this);
    }

    public getVariantDiscriminant(variant: keyof Def): number {
        return this.def[variant].discriminant;
    }

    public getDiscriminantVariant(discriminant: number): keyof Def {
        return this.disVarMap[discriminant];
    }

    public createCodec(codecs: EnumCodecsMap<Def>): EnumCodec<Def> {
        return new EnumCodec(this, codecs);
    }
}

export type EnumCodecsMap<Def> = {
    [V in ValuableVariants<Def>]: Def[V] extends Valuable<infer T> ? Codec<T> : never;
};

export class EnumCodec<Def> implements Codec<Enum<Def>> {
    private schema: EnumSchema<Def>;

    private codecs: EnumCodecsMap<Def>;

    public constructor(schema: EnumSchema<Def>, codecs: EnumCodecsMap<Def>) {
        this.schema = schema;
        this.codecs = codecs;
        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }

    public encode(val: Enum<Def>): Uint8Array {
        const { variant, content } = val;
        const discriminant = this.schema.getVariantDiscriminant(variant);
        const codec = this.codecByVariant(variant);

        const arrs: Uint8Array[] = [new Uint8Array([discriminant])];
        if (codec) {
            if (!content) throw new Error(`Codec for variant "${variant}" defined, but there is no content`);
            arrs.push(codec.encode(content.value));
        }

        return concatUint8Arrays(arrs);
    }

    public decode(bytes: Uint8Array): DecodeResult<Enum<Def>> {
        const DISCRIMINANT_BYTES_COUNT = 1;
        const discriminant = bytes[0];
        const variant = this.schema.getDiscriminantVariant(discriminant);
        const codec = this.codecByVariant(variant);

        if (codec) {
            const [decoded, decodedLen] = codec.decode(bytes.subarray(1));

            return [
                Enum.create(variant as ValuableVariants<Def>, decoded as any),
                DISCRIMINANT_BYTES_COUNT + decodedLen,
            ];
        }

        return [Enum.create(variant as EmptyVariants<Def>), DISCRIMINANT_BYTES_COUNT];
    }

    private codecByVariant(variant: keyof Def): Codec<unknown> | null {
        return variant in this.codecs ? this.codecs[variant as keyof EnumCodecsMap<Def>] : null;
    }
}
