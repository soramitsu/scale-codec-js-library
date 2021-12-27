import { Enum, Valuable } from './enum'

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString: Option<string> = Enum.empty('None')
 * ```
 */
export type Option<T> = Enum<{
    None: undefined
    Some: Valuable<T>
}>
