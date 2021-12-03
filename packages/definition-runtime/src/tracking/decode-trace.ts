import { DecodeResult } from '@scale-codec/core';
import { assert } from '@scale-codec/util';
import { Fmt, fmt, sub } from 'fmt-subs';
import { tryInspectValue, prettyDecodeInput } from './util';

export interface DecodeTraceResult {
    value: unknown;
    bytes: number;
}

class DecodeTraceResultInspector implements DecodeTraceResult {
    private raw: DecodeResult<unknown>;

    private inspectedOnce: null | [unknown] = null;

    public constructor(raw: DecodeResult<unknown>) {
        this.raw = raw;
    }

    public get bytes(): number {
        return this.raw[1];
    }

    public get value(): unknown {
        if (!this.inspectedOnce) {
            this.inspectedOnce = [tryInspectValue(this.raw[0])];
        }

        return this.inspectedOnce[0];
    }
}

export class DecodeTrace {
    public parent: DecodeTrace | null = null;

    /**
     * Location
     */
    public loc: string[];

    public input?: Uint8Array;
    public result?: DecodeTraceResult;
    public error?: unknown;
    public children: DecodeTrace[] = [];

    public constructor(loc: string) {
        this.loc = [loc];
    }

    public findRoot(): DecodeTrace {
        return this.parent ? this.parent.findRoot() : this;
    }

    public get isRoot(): boolean {
        return !this.parent;
    }

    public setParent(trace: DecodeTrace): this {
        this.parent = trace;
        return this;
    }

    public refineLoc(loc: string): this {
        this.loc.push(loc);
        return this;
    }

    public setInput(input: Uint8Array): this {
        this.input = input;
        return this;
    }
}

export class DecodeTraceCollector {
    private current: DecodeTrace | null = null;

    public decodeStart(loc: string, input: Uint8Array) {
        if (this.current && !this.current.input) {
            this.current.setInput(input).refineLoc(loc);
        } else {
            const newTrace = new DecodeTrace(loc).setInput(input);

            if (!this.current) {
                this.current = newTrace;
            } else {
                const child = newTrace.setParent(this.current);
                this.current.children.push(child);
                this.current = child;
            }
        }
    }

    /**
     * @returns the root decode trace if it was the root
     */
    public decodeSuccess(result: DecodeResult<unknown>): null | DecodeTrace {
        assert(this.current, 'No current');
        this.current.result = new DecodeTraceResultInspector(result);

        if (!this.current.parent) {
            const trace = this.current;
            this.current = null;
            return trace;
        } else {
            this.current = this.current.parent;
            return null;
        }
    }

    /**
     * @returns Returns root trace
     */
    public decodeError(err: unknown): DecodeTrace {
        assert(this.current, 'No current');
        this.current.error = err;
        return this.current.findRoot();
    }

    public refineLoc(loc: string) {
        assert(this.current, 'No current');

        if (this.current.input) {
            const newTrace = new DecodeTrace(loc).setParent(this.current);
            this.current.children.push(newTrace);
            this.current = newTrace;
        } else {
            this.current.refineLoc(loc);
        }
    }
}

export interface BuildTraceStepsFmtParams {
    /**
     * See {@link PrettyDecodeInputParams.bytesLimit}
     */
    bytesPrintLimit?: number;
}

function tracePath(trace: DecodeTrace): string[] {
    const path: string[] = [];

    for (let current: DecodeTrace | null = trace; current; current = current.parent) {
        for (let len = current.loc.length, i = len - 1; i >= 0; i--) {
            path.push(current.loc[i]);
        }
    }

    path.reverse();

    return path;
}

const INDENT = ' '.repeat(4);

function buildStepsRecursive(trace: DecodeTrace, params?: BuildTraceStepsFmtParams): Fmt {
    const errored = !!trace.error;
    const resultVal = trace.result;

    const path = tracePath(trace).join(' / ');
    const result = errored
        ? fmt`ERROR - ${sub(trace.error, '%s')}`
        : resultVal
        ? sub(resultVal.value, '%O')
        : '<not computed>';
    const input = trace.input
        ? prettyDecodeInput(trace.input, {
              used: resultVal?.bytes,
              bytesLimit: params?.bytesPrintLimit,
          })
        : '<no input>';

    let acc = Fmt.concat(
        fmt`${path}\n`,
        fmt`${INDENT}Input: ${input}\n`,
        fmt`${INDENT}Children: ${trace.children.length}\n`,
        fmt`${INDENT}Result: ${result}\n`,
    );

    if (trace.children.length) {
        acc = acc.concat(
            ...trace.children.map((x) => buildStepsRecursive(x, params)),
            // fmt`  ...${path}\n  Result: ${result}\n`,
        );
    } else {
        // acc = acc.concat(fmt`  Result: ${result}\n`);
    }

    return acc;

    // if (!trace.children.length) {
    //     result = result.concat(
    //         fmt`${
    //             trace.input
    //                 ? prettyDecodeInput(trace.input, {
    //                       used: resultVal?.bytes,
    //                       bytesLimit: params?.bytesPrintLimit,
    //                   })
    //                 : '<no input>'
    //         }\n`,
    //     );
    // } else {
    //     result = result.concat(...trace.children.map((x) => buildStepsRecursive(x, params)));
    // }

    // /*
    //     Value: maybe result or error
    //       <its input maybe with used bytes>
    //     Value -> ::U128 -> U128: maybe result or error

    //  */

    // const path = tracePath(trace);

    // const decodeResultFmt = errored
    //     ? fmt`ERROR - ${sub(trace.error, '%s')}`
    //     : resultVal
    //     ? sub(resultVal.value, '%O')
    //     : '<not computed>';

    // result = result.concat(fmt`  ${path.join(' 🡪 ')}: ${decodeResultFmt}\n`);

    // return result;
}

/**
 * @remarks
 * This function shouldn't be in the `DecodeTrace` class itself due to provide a tree-shaking possibility. This is not
 * the main part of this class, but the side tool, used for pretty-print in the console.
 */
export function buildDecodeTraceStepsFmt(trace: DecodeTrace, params?: BuildTraceStepsFmtParams): Fmt {
    return buildStepsRecursive(trace, params);
}
