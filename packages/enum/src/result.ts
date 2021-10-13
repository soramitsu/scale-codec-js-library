import { Enum, Valuable } from './enum';

/**
 * Rust's `Result<O, E>` analog
 *
 * @example
 *
 * ```ts
 * const file: Result<string, Error> = Enum.create('Ok', 'file contents')
 * ```
 */
export type Result<O, E> = Enum<{
    Ok: Valuable<O>;
    Err: Valuable<E>;
}>;
