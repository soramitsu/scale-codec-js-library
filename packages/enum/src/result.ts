import { Enum } from './enum'

/**
 * Rust's `Result<O, E>` analog
 *
 * @example
 *
 * ```ts
 * const file: Result<string, Error> = Enum.valuable('Ok', 'file contents')
 * ```
 */
export type Result<Ok, Err> = Enum<['Ok', Ok] | ['Err', Err]>
