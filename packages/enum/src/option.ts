import { Enum, Valuable } from './enum';

export type Option<T> = Enum<{
    None: undefined;
    Some: Valuable<T>;
}>;
