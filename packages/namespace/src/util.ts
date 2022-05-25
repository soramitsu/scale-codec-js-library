export function typedToEntries<T>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as any
}

export function typedFromEntries<K extends string | number | symbol, V>(entries: [K, V][]): Record<K, V> {
  return Object.fromEntries(entries) as any
}
