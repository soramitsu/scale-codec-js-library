// import { PolkaType, reg } from './polka'

export function factory() {
  return new Set<bigint>(Array.from({ length: 50 }, (_, i) => BigInt(i) << BigInt(~~((i * 120) / 50))))
}

// export function nativeToPolka(set: Set<bigint | number>) {
//     return new PolkaType(reg, set)
// }
