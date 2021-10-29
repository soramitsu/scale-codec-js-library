import { Enum, Valuable } from './enum';

/**
 * Rust's `Option<T>` analog
 *
 * @example
 *
 * ```ts
 * const maybeString: Option<string> = Enum.create('None')
 * ```
 */
export type Option<T> = Enum<{
    None: undefined;
    Some: Valuable<T>;
}>;
