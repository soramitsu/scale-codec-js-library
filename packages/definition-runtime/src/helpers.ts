import {
    Decode,
    Encode,
    EnumDecoders,
    EnumEncoders,
    makeEncoderAsIsRespectable,
    StructEncoders,
    TupleEncoders,
} from '@scale-codec/core';

export function helperStructEncoders(encoders: StructEncoders<any>): StructEncoders<any> {
    const mapped: StructEncoders<any> = {};

    Object.entries(encoders).forEach(([key, encode]) => {
        mapped[key] = makeEncoderAsIsRespectable(encode as any);
    });

    return mapped;
}

export function helperTupleEncoders<T extends any[]>(encoders: TupleEncoders<T>): TupleEncoders<T> {
    return encoders.map(makeEncoderAsIsRespectable) as any;
}

export type HelperEnumDiscriminantVariantPair = [discriminant: number, variantName: string];

export type HelperEnumEncodersMap = Record<string, Encode<any> | undefined>;
export type HelperEnumDecodersMap = Record<number, Decode<any> | undefined>;

// export function helperEnumSchemaMapper(
//     variants: HelperEnumSchemaMapperVariant[],
// ): [decoders: EnumDecoders, encoders: EnumEncoders] {
//     const encoders: EnumEncoders = {};
//     const decoders: EnumDecoders = {};

//     for (const [discriminant, variantName, maybeDecode, maybeEncode] of variants) {
//         encoders[variantName] = { d: discriminant, encode: maybeEncode && makeEncoderAsIsRespectable(maybeEncode) };
//         decoders[discriminant] = { v: variantName, decode: maybeDecode };
//     }

//     return [decoders, encoders];
// }

export function helperEnumEncoders(
    pairs: HelperEnumDiscriminantVariantPair[],
    encoders: HelperEnumEncodersMap,
): EnumEncoders {
    const result: EnumEncoders = {};

    for (const [dis, name] of pairs) {
        const encoder = encoders[name];
        result[name] = { d: dis, encode: encoder && makeEncoderAsIsRespectable(encoder) };
    }

    return result;
}

export function helperEnumDecoders(
    pairs: HelperEnumDiscriminantVariantPair[],
    decoders: HelperEnumDecodersMap,
): EnumDecoders {
    const result: EnumDecoders = {};

    for (const [dis, name] of pairs) {
        const decoder = decoders[dis];
        result[dis] = { v: name, decode: decoder };
    }

    return result;
}

export function helperMapEncoders(key: Encode<any>, value: Encode<any>): [key: Encode<any>, value: Encode<any>] {
    return [key, value].map(makeEncoderAsIsRespectable) as any;
}
