import { AllowedBits, BigIntCodecOptions, Codec, bigIntCodec, decodeBigInt, encodeBigInt } from '@scale-codec/core'
import JSBI from 'jsbi'

function codecBigInt(bits: AllowedBits, signed: boolean): Codec<JSBI> {
  return bigIntCodec({ bits, signed, endianness: 'le' })
}

/**
 * Optimal codec for integers that compatible with native JS numbers (which are f64)
 */
function codecJsNum(bits: Exclude<AllowedBits, 64 | 128>, signed: boolean): Codec<number> {
  const opts: BigIntCodecOptions = { bits, signed, endianness: 'le' }

  return {
    encode: (v) => encodeBigInt(JSBI.BigInt(v), opts),
    decode: (b) => {
      const [bn, count] = decodeBigInt(b, opts)
      return [JSBI.toNumber(bn), count]
    },
  }
}

export const i8 = codecJsNum(8, true)
export const i16 = codecJsNum(16, true)
export const i32 = codecJsNum(32, true)
export const i64 = codecBigInt(64, true)
export const i128 = codecBigInt(128, true)
export const u8 = codecJsNum(8, false)
export const u16 = codecJsNum(16, false)
export const u32 = codecJsNum(32, false)
export const u64 = codecBigInt(64, false)
export const u128 = codecBigInt(128, false)
