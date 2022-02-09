import { U64, VecFixed } from '@polkadot/types-codec'

const ArrU64L32 = VecFixed.with(U64, 32)

export const encode = (arr: bigint[]): Uint8Array => {
    return new ArrU64L32(null as any, arr).toU8a()
}

export const decode = (input: Uint8Array): bigint[] => {
    const arr = new ArrU64L32(null as any, input)
    // not very fair, but this is the Polka's way
    return arr.map((x) => x.toBigInt())
}
