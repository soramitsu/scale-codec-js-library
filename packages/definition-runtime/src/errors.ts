import { Decode, DecodeResult, Enum, Option } from '@scale-codec/core';
import { assert, hexifyBytes } from '@scale-codec/util';
import { Fmt, fmt, sub } from 'fmt-subs';

type DecodeStack = DecodeStackEntry[];

type DecodeStackEntry = [loc: string, input: Uint8Array];

// const __DECODE_STACK: DecodeStack = [];
// let __DECODE_ERRORED = false;

// const BYTES_RENDER_LIMIT = 20;

function renderBytes(b: Uint8Array, bytesLimit = 20): string {
    if (!b.length) {
        return '<empty>';
    }

    const moreBytes = b.length - bytesLimit;
    const tooLong = b.length > bytesLimit;
    const tooLongMsg = moreBytes && moreBytes === 1 ? '1 more byte' : `${moreBytes} more bytes`;

    const cutted = b.subarray(0, bytesLimit || Infinity);
    const hex = hexifyBytes(cutted);
    return tooLong ? `${hex} and ${tooLongMsg}` : hex;
}

function renderStack(stack: DecodeStack): string {
    let acc: string[] = [];

    for (let len = stack.length, i = len - 1; i >= 0; i--) {
        const [loc, input] = stack[i];
        acc.push(`at ${loc} <== ${renderBytes(input)}`);
    }

    return acc.join('\n    ');
}

function renderDecodeErrorMessage(original: unknown, stack: DecodeStack): string {
    return `Error occured while decoding: ${original}\n    ${renderStack(stack)}`;
}

export type TrackDecodeFn = <T>(loc: string, input: Uint8Array, decode: Decode<T>) => DecodeResult<T>;

export interface DebugTracker {
    decode?: TrackDecodeFn;
}

function reportError(format: string, ...args: any[]): void {
    console.error(`[SCALE debug tracker] ${format}`, ...args);
}

interface Trace {
    parent?: Trace;
    loc: string;
    input: Uint8Array;
    result?: DecodeResult<unknown>;
    children: Trace[];
}

// interface TraceDirect {}

function reportTrace(params: { trace: Trace; depth?: number; erroredTrace?: Trace }): Fmt {
    const { trace, erroredTrace } = params;
    const depth = params.depth ?? 0;

    const errored = trace === erroredTrace;
    const hasChildren = !!trace.children.length;
    const resultVal = trace.result;

    const depthSpaces = ' '.repeat(depth * 2);
    const renderedChildren =
        hasChildren &&
        trace.children
            .map((x) => reportTrace({ trace: x, depth: depth + 1, erroredTrace }))
            .reduce((a, b) => a.concat(fmt`\n`, b));
    const renderedInput = resultVal ? renderBytes(trace.input.subarray(0, resultVal[1])) : renderBytes(trace.input);
    const renderedVal = resultVal && sub(resultVal[0], '%O');
    const innerContent = renderedChildren ? fmt`\n${renderedChildren}\n${depthSpaces}` : renderedInput;
    const resultFmt = renderedVal ? fmt` => ${renderedVal}` : '';
    // const result = fmt``

    return fmt`${depthSpaces}${errored ? '**ERROR** ' : ''}${trace.loc} (${innerContent})${resultFmt}`;

    // if (!trace.children.length) {
    //     if (trace.result) {
    //         return fmt`${errored ? '**ERROR**' : ''}${depthSpaces}${trace.loc} (${renderBytes(
    //             trace.input.subarray(0, trace.result[1]),
    //         )} => ${sub(trace.result[0], '%O')})`;
    //     }

    //     return fmt`${depthSpaces}${trace.loc} (${renderBytes(trace.input)} => ?????)`;
    // }

    // // const renderedChildren = trace.children
    // //     .map((x) => reportTrace({ trace, depth: depth + 1, erroredTrace }))
    // //     .reduce((a, b) => a.concat(fmt`\n`, b));

    // const result = trace.result;

    // return result
    //     ? fmt`${depthSpaces}${trace.loc} (\n${renderedChildren}\n${depthSpaces}  => ${sub(
    //           result[0],
    //           '%O',
    //       )}\n${depthSpaces})`
    //     : fmt`${depthSpaces}${trace.loc} (\n${renderedChildren}\n${depthSpaces})`;

    // return fmt`${depthSpaces}${trace.loc} (\n${renderedChildren}\n${depthSpaces}  => ${sub(
    //     trace.result?.[0],
    //     '%O',
    // )}\n${depthSpaces})`;
}

function findRootTrace(trace: Trace): Trace {
    return trace.parent ? findRootTrace(trace.parent) : trace;
}

class TraceCollector {
    private current: Trace | null = null;

    public decodeStart(loc: string, input: Uint8Array) {
        if (!this.current) {
            this.current = { loc, children: [], input };
        } else {
            const child: Trace = { loc, children: [], input, parent: this.current };
            this.current.children.push(child);
            this.current = child;
        }
    }

    public decodeSuccess(result: DecodeResult<unknown>) {
        assert(this.current, 'No current');
        Object.assign(this.current, { result });
        this.current = this.current.parent ?? null;
    }

    public report() {
        if (this.current) {
            console.error(
                ...reportTrace({
                    trace: findRootTrace(this.current),
                }).assemble(),
            );
        }
        console.error('No current');
    }
}

export class DefaultTracker implements DebugTracker {
    private decodeLocsTrace: string[] = [];
    private decodeHist: [locs: string[], input: Uint8Array, decodedBytes: number][] = [];
    private decodeErrored = false;
    private tracer = new TraceCollector();

    public decode<T>(loc: string, input: Uint8Array, decode: Decode<T>): DecodeResult<T> {
        try {
            this.decodeLocsTrace.push(loc);
            this.tracer.decodeStart(loc, input);
            // this.decodeStack.push([loc, input]);
            const [value, bytes] = decode(input);
            this.decodeHist.push([[...this.decodeLocsTrace], input, bytes]);
            this.tracer.decodeSuccess([value, bytes]);
            return [value, bytes];
        } catch (err) {
            if (!this.decodeErrored) {
                this.decodeErrored = true;

                this.tracer.report();

                // const lines = this.decodeHist.map(([locs, input, decodedBytes]) => {
                //     const circsCount = decodedBytes * 2 + (decodedBytes - 1);
                //     const circs = '^'.repeat(circsCount);
                //     return `${renderBytes(input)}\n${circs} (${decodedBytes} bytes) - ${locs.join('.')}`;
                // });
                // console.log(lines.join('\n\n'));

                // for (const  of ) {
                //     console.log
                // }

                // console.log(this.decodeHist);
                reportError(`err`);
            }
            throw err;
        } finally {
            this.decodeLocsTrace.pop();
            if (!this.decodeLocsTrace.length) {
                this.decodeHist = [];
                this.decodeErrored = false;
            }
        }
    }

    public within<T>(runFn: () => T): T {
        try {
            setCurrentTracker(this);
            return runFn();
        } finally {
            setCurrentTracker(null);
        }
    }
}

let __currentTracker: null | DebugTracker = null;

export function setCurrentTracker(tracker: null | DebugTracker) {
    __currentTracker = tracker;
}

export function trackDecode<T>(loc: string, input: Uint8Array, decode: Decode<T>): DecodeResult<T> {
    if (__currentTracker?.decode) {
        return __currentTracker.decode(loc, input, decode);
    }
    return decode(input);
}
