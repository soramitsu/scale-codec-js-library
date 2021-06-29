import { Enum, Valuable } from './enum';

export type Option<T> = Enum<{
    None: undefined;
    Some: Valuable<T>;
}>;

// export function Some<T>(value: T): Option<T> {
//     return Enum.create('Some', value);
// }

// export function None<T>(): Option<T> {
//     return Enum.create('None');
// }

// export class Option<T> extends Enum<{
//     Some: { value: T };
//     None: undefined;
// }> {
//     public static Some<T>(value: T): Option<T> {
//         return new Option('Some', { value });
//     }

//     public static None<T>(): Option<T> {
//         return new Option('None');
//     }

//     public unwrap(): T {
//         return this.as('Some');
//     }

//     // TODO
// }
