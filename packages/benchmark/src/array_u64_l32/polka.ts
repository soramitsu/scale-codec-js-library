import { U64, VecFixed } from '@polkadot/types-codec'

const ArrU64L32 = VecFixed.with(U64, 32)

export const encode = (arr: any[]): Uint8Array => {
    return new ArrU64L32(null as any, arr).toU8a()
}
