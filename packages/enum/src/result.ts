import { Enum, Valuable } from './enum';

export type Result<O, E> = Enum<{
    Ok: Valuable<O>;
    Err: Valuable<E>;
}>;
