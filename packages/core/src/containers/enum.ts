import { concatUint8Arrays } from '@scale-codec/util';
import { Enum, Option } from '@scale-codec/enum';
import { Decode, DecodeResult, Encode } from '../types';

export type EnumSchemaDef<Def> = {
    [K in keyof Def]: { discriminant: number };
};

/**
 * Unsafe-typed params of enum encoding. It's a map with variant names as keys and discriminant + maybe encode fn as
 * values
 */
export type EncodeEnumParams = Record<
    string | number | symbol,
    {
        /**
         * Variant discriminant
         */
        d: number;
        encode?: Encode<any>;
    }
>;

export type DecodeEnumParams = Record<
    number,
    {
        v: string | number | symbol;
        decode?: Decode<any>;
    }
>;

const DISCRIMINANT_BYTES_COUNT = 1;

export function encodeEnum<Def>(val: Enum<Def>, params: EncodeEnumParams): Uint8Array {
    const { variant, content } = val;
    const { d, encode } = params[variant];

    function* parts(): Generator<Uint8Array> {
        yield new Uint8Array([d]);
        if (encode) {
            if (!content) throw new Error(`Codec for variant "${variant}" defined, but there is no content`);
            yield encode(content.value);
        }
    }

    return concatUint8Arrays(parts());
}

export function decodeEnum<Def>(bytes: Uint8Array, params: DecodeEnumParams): DecodeResult<Enum<Def>> {
    const d = bytes[0];
    const { v, decode } = params[d];

    if (decode) {
        const [decodedContent, contentBytes] = decode(bytes.subarray(1));

        return [Enum.create(v as any, decodedContent), DISCRIMINANT_BYTES_COUNT + contentBytes];
    }

    return [Enum.create(v as any), DISCRIMINANT_BYTES_COUNT];
}

function optBoolByteToEnum(byte: number): Option<boolean> {
    switch (byte) {
        case 0:
            return Enum.create('None');
        case 1:
            return Enum.create('Some', true);
        case 2:
            return Enum.create('Some', false);
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
