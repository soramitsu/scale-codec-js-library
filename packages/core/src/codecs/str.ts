import { decodeUint8Vec } from './vec'
import { Walker } from '../types'
import { encodeFactory } from '../util'
import { encodeCompact } from './compact'

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', {
  // do not allow invalid utf-8 sequences
  fatal: true,
})

export function decodeStr(walker: Walker): string {
  const utf8Bytes = decodeUint8Vec(walker)
  const str = decoder.decode(utf8Bytes)
  return str
}

/**
 * Returns the byte length of an UTF-8 string
 *
 * @remarks
 * Source: https://stackoverflow.com/a/23329386
 */
function utf8ByteLength(str: string): number {
  let acc = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) acc++
    else if (code > 0x7ff && code <= 0xffff) acc += 2
    if (code >= 0xdc00 && code <= 0xdfff) i-- // trail surrogate
  }
  return acc
}

export const encodeStr = encodeFactory<string>(
  (str, walker) => {
    const byteLength = utf8ByteLength(str)

    encodeCompact(byteLength, walker)
    const result = encoder.encodeInto(str, walker.u8.subarray(walker.idx))

    if (result.written !== byteLength)
      throw new Error(
        `SCALE internal error: counting of string bytes length is incorrect; ` +
          `string: "${str}"; actual bytes length: ${result.written}; ` +
          `computed: ${byteLength}; please report a bug.`,
      )

    walker.idx += byteLength
  },
  (str) => {
    const len = utf8ByteLength(str)
    return len + encodeCompact.sizeHint(len)
  },
)
