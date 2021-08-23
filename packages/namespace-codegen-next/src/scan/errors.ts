export type ScanErrorMeta = Record<string, unknown>;

export class ScanError extends Error {
    public static BadReference(whichOne: string): ScanError {
        return new ScanError({
            type: 'bad reference',
            message: `Bad reference found: ${whichOne}`,
        });
    }

    private type: string;

    private where: string | undefined;

    public constructor(params: { type: string; message: string }) {
        super(params.message);
        this.type = params.type;
    }

    public defineWhere(where: string): void {
        this.where = where;
    }
}
