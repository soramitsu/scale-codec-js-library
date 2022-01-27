import { Enum } from './enum'

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString: Option<string> = Enum.empty('None')
 * ```
 */
export type Option<T> = Enum<'None' | ['Some', T]>
