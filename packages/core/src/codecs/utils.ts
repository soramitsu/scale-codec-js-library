// import { Decode, Walker } from '../types'

// export function decodeIteratively<T>(walker: Walker, decoders: Iterable<Decode<T>>): T[] {
//     const decoded: T[] = []
//     let totalDecodedBytes = 0

//     for (const decode of decoders) {
//         const [item, decodedLen] = decode(bytes.subarray(totalDecodedBytes))
//         decoded.push(item)
//         totalDecodedBytes += decodedLen
//     }

//     return [decoded, totalDecodedBytes]
// }
