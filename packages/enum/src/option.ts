import { Enum } from './enum';

export class Option<T> extends Enum<{
    Some: { value: T };
    None: undefined;
}> {
    public static Some<T>(value: T): Option<T> {
        return new Option('Some', { value });
    }

    public static None<T>(): Option<T> {
        return new Option('None');
    }

    public unwrap(): T {
        return this.as('Some');
    }

    // TODO
}
