import { Enum } from './enum';

export class Result<O, E> extends Enum<{
    Ok: { value: O };
    Err: { value: E };
}> {
    public static Ok<O, E>(ok: O): Result<O, E> {
        return new Result('Ok', { value: ok });
    }

    public static Err<O, E>(err: E): Result<O, E> {
        return new Result('Err', { value: err });
    }

    // TODO unwraps, mappings etc
}
