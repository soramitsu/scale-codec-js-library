import { concatUint8Arrays } from '@scale-codec/util';
import { Enum, Option } from '@scale-codec/enum';
import { Decode, DecodeResult, Encode } from '../types';

export type EnumSchemaDef<Def> = {
    [K in keyof Def]: { discriminant: number };
};

/**
 * Unsafe-typed params for enum encoding. It defines relationships between variant names and their
 * discriminants, as well as it defines encode functions for particular variants.
 *
 * @example
 *
 * ```ts
 * type MyEnum = Enum<{
 *     A: null
 *     B: Valuable<string>
 * }>
 *
 * const encoders: EnumEncoders = {
 *     A: { d: 0 },
 *     B: { d: 1, encode: encodeStrCompact }
 * }
 * ```
 */
export type EnumEncoders = Record<
    string | number | symbol,
    {
        /**
         * Variant discriminant
         */
        d: number;
        encode?: Encode<any>;
    }
>;

/**
 * Unsafe-type for enum decoding. It defines relationships between discriminants and their variant names,
 * as well as it defines decode functions for particular variants. If function is specified,
 * then a non-empty enum will be created.
 *
 * @example
 *
 * ```ts
 * type MyEnum = Enum<{
 *     A: null
 *     B: Valuable<string>
 * }>
 *
 * const decoders: EnumDecoders = {
 *     0: { v: 'A' },
 *     1: { v: 'B', decode: decodeStrCompact }
 * }
 * ```
 */
export type EnumDecoders = Record<
    number,
    {
        v: string | number | symbol;
        decode?: Decode<any>;
    }
>;

const DISCRIMINANT_BYTES_COUNT = 1;

export function encodeEnum<Def>(val: Enum<Def>, encoders: EnumEncoders): Uint8Array {
    const { variant, content } = val;
    const { d, encode } = encoders[variant];

    function* parts(): Generator<Uint8Array> {
        yield new Uint8Array([d]);
        if (encode) {
            if (!content) throw new Error(`Codec for variant "${variant}" defined, but there is no content`);
            yield encode(content[0]);
        }
    }

    return concatUint8Arrays(parts());
}

export function decodeEnum<Def>(bytes: Uint8Array, decoders: EnumDecoders): DecodeResult<Enum<Def>> {
    const d = bytes[0];
    const { v, decode } = decoders[d];

    if (decode) {
        const [decodedContent, contentBytes] = decode(bytes.subarray(1));

        return [Enum.valuable(v as any, decodedContent), DISCRIMINANT_BYTES_COUNT + contentBytes];
    }

    return [Enum.empty(v as any), DISCRIMINANT_BYTES_COUNT];
}

function optBoolByteToEnum(byte: number): Option<boolean> {
    switch (byte) {
        case 0:
            return Enum.empty('None');
        case 1:
            return Enum.valuable('Some', true);
        case 2:
            return Enum.valuable('Some', false);
        default:
            throw new Error(`Failed to decode OptionBool - byte is ${byte}`);
    }
}

/**
 * Special encoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const encodeOptionBool: Encode<Option<boolean>> = (item) =>
    new Uint8Array([
        item.match({
            None: () => 0,
            Some: (val) => (val ? 1 : 2),
        }),
    ]);

/**
 * Special decoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const decodeOptionBool: Decode<Option<boolean>> = ([byte]) => [optBoolByteToEnum(byte), 1];
