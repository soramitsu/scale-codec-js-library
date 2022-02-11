export function setFactory() {
    return new Set<bigint | number>(Array.from({ length: 50 }, (_, i) => BigInt(i) << BigInt(~~((i * 120) / 50))))
}
