export type ResultOk<T> = {
    t: 'ok';
    value: T;
};

export type ResultErr<T> = {
    t: 'err';
    value: T;
};

export class Result<Ok, Err> {
    public static Ok<O, E>(ok: O): Result<O, E> {
        return new Result<O, E>({ t: 'ok', value: ok });
    }

    public static Err<O, E>(err: E): Result<O, E> {
        return new Result<O, E>({ t: 'err', value: err });
    }

    private readonly value: ResultOk<Ok> | ResultErr<Err>;

    private constructor(value: ResultOk<Ok> | ResultErr<Err>) {
        this.value = value;
    }

    public map<OkThen>(fn: (ok: Ok) => OkThen): Result<OkThen, Err> {}

    public mapErr<ErrThen>(fn: (err: Err) => ErrThen): Result<Ok, ErrThen> {}

    public unwrap(): Ok {}

    public unwrapErr(): Err {}

    public and<OkOther, ErrOther, OkThen, ErrThen>(
        other: Result<OkOther, ErrOther>,
        mergeOkFn: (self: Ok, other: OkOther) => OkThen,
        mergeErrFn: (self: Err, other: ErrOther) => ErrThen,
    ): Result<OkThen, ErrThen> {}

    // public mergeErr<ErrOther, ErrThen>(
    //     other: Result<unknown, ErrOther>,
    //     fn: (self: Err, other: ErrOther) => ErrThen,
    // ): Result<Ok, ErrThen> {}

    public get isOk(): boolean {
        return this.value.t === 'ok';
    }

    public get isErr(): boolean {
        return this.value.t === 'err';
    }
}

// export type Result<Ok, Err> = ResultOk<Ok> | ResultErr<Err>;

// export function resultMap<Ok, OkThen, Err>(res: Result<Ok, Err>, mapFn: (value: Ok) => OkThen): Result<OkThen, Err> {
//     if (res.t === 'ok') {
//         return {
//             t: 'ok',
//             value: mapFn(res.value),
//         };
//     }
//     return res;
// }
