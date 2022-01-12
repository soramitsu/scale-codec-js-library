import { concatUint8Arrays } from '@scale-codec/util'
import { Enum, Option } from '@scale-codec/enum'
import { Decode, DecodeResult, Encode } from '../types'

export type EnumSchemaDef<Def> = {
    [K in keyof Def]: { discriminant: number }
}

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
        d: number
        encode?: Encode<any>
    }
>

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
        v: string | number | symbol
        decode?: Decode<any>
    }
>

const DISCRIMINANT_BYTES_COUNT = 1

export function encodeEnum<T extends Enum<any>>(val: T, encoders: EnumEncoders): Uint8Array {
    const { tag, content } = val
    const encoder = encoders[tag]
    if (!encoder) {
        const schemaFormatted = Object.entries(encoders)
            .map(([tag, encodeData]) => {
                const maybeTagSuffix = encodeData.encode ? '(...)' : ''
                return `${tag}${maybeTagSuffix} => ${encodeData.d}`
            })
            .join(', ')

        throw new Error(
            `Encode data for variant with tag "${tag}" is undefined. Enum encoders schema: ${schemaFormatted}`,
        )
    }
    const { d, encode } = encoder

    function* parts(): Generator<Uint8Array> {
        yield new Uint8Array([d])
        if (encode) {
            if (!content) throw new Error(`Encoder for variant with tag "${tag}" defined, but there is no content`)
            yield encode(content[0])
        }
    }

    return concatUint8Arrays(parts())
}

export function decodeEnum<T extends Enum<any>>(bytes: Uint8Array, decoders: EnumDecoders): DecodeResult<T> {
    const d = bytes[0]
    const decoder = decoders[d]
    if (!decoder) {
        const schemaFormatted = Object.entries(decoders)
            .map(([discriminant, varAndDecoder]) => {
                let right = String(varAndDecoder.v)
                if (varAndDecoder.decode) {
                    right += '(...)'
                }
                return `${discriminant} => ${right}`
            })
            .join(', ')

        throw new Error(`Decode data for discriminant ${d} is undefined. Enum decoders schema: ${schemaFormatted}`)
    }

    const { v, decode } = decoder

    if (decode) {
        const [decodedContent, contentBytes] = decode(bytes.subarray(1))

        return [Enum.valuable<any, any>(v as any, decodedContent) as any, DISCRIMINANT_BYTES_COUNT + contentBytes]
    }

    return [Enum.empty<any>(v as any) as any, DISCRIMINANT_BYTES_COUNT]
}

function optBoolByteToEnum(byte: number): Option<boolean> {
    switch (byte) {
        case 0:
            return Enum.empty('None')
        case 1:
            return Enum.valuable('Some', true)
        case 2:
            return Enum.valuable('Some', false)
        default:
            throw new Error(`Failed to decode OptionBool - byte is ${byte}`)
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
    ])

/**
 * Special decoder for `OptionBool` type from Rust's parity_scale_codec
 */
export const decodeOptionBool: Decode<Option<boolean>> = ([byte]) => [optBoolByteToEnum(byte), 1]
