import { Fmt, fmt } from 'fmt-subs'
import { Walker, Decode } from '@scale-codec/core'
import { getCurrentTracker, setCurrentTracker } from './current'
import { buildDecodeTraceStepsFmt, DecodeTraceCollector, DecodeTrace } from './decode-trace'
import { CodecTracker } from './types'

export interface LoggerConfig {
    /**
     * @default true
     */
    logDecodeErrors?: boolean

    /**
     * @default false
     */
    logDecodeSuccesses?: boolean
}

function logError(format: string, ...args: any[]): void {
    console.error(`[SCALE] ${format}`, ...args)
}

function logDebug(format: string, ...args: any[]): void {
    console.debug(`[SCALE] ${format}`, ...args)
}

/**
 * Prints tracked info to console
 *
 * @example
 * ```ts
 * import { Logger } from 'lib'
 *
 * new Logger().mount()
 *
 * // use decoding functions and see console output
 * ```
 */
export class Logger implements CodecTracker {
    public config?: LoggerConfig

    private decodeTracer = new DecodeTraceCollector()
    private decodeCurrentDepth = 0
    private decodeErrorHandled = false

    public constructor(config?: LoggerConfig) {
        this.config = config
    }

    private get logDecodeErrors(): boolean {
        return this.config?.logDecodeErrors ?? true
    }

    private get logDecodeOk(): boolean {
        return this.config?.logDecodeSuccesses ?? false
    }

    public decode<T>(loc: string, walker: Walker, decode: Decode<T>): T {
        try {
            this.decodeCurrentDepth++
            this.decodeTracer.decodeStart(loc, walker)

            const value = decode(walker)

            const maybeRootTrace = this.decodeTracer.decodeSuccess(walker, value)
            if (maybeRootTrace && this.logDecodeOk) {
                const tree = this.buildDecodeTree(maybeRootTrace, walker)
                logDebug(...fmt`Decode of "${maybeRootTrace.loc}" succeed\n\nDecode steps:\n\n${tree}`.assemble())
            }

            return value
        } catch (err) {
            if (!this.decodeErrorHandled) {
                this.decodeErrorHandled = true

                const trace = this.decodeTracer.decodeError(err)

                if (this.logDecodeErrors) {
                    const tree = this.buildDecodeTree(trace, walker)
                    logError(
                        ...fmt`Decode of "${trace.loc}" failed with error: ${err}\n\nDecode steps:\n\n${tree}`.assemble(),
                    )
                }
            }
            throw err
        } finally {
            if (!--this.decodeCurrentDepth) {
                // resetting
                this.decodeErrorHandled = false
            }
        }
    }

    public refineDecodeLoc<T>(loc: string, decode: () => T): T {
        this.decodeTracer.refineLoc(loc)
        return decode()
    }

    /**
     * Sets itself as current global tracker
     */
    public mount() {
        const current = getCurrentTracker()
        if (current && current !== this) throw new Error('Something is already mounted')
        if (!current) {
            setCurrentTracker(this)
        }
    }

    /**
     * Unmounts itself from 'current tracker' position. If it is not current, it throws
     */
    public unmount() {
        const current = getCurrentTracker()
        if (current === this) {
            setCurrentTracker(null)
        }
        throw new Error('This tracker is not mounted')
    }

    private buildDecodeTree(trace: DecodeTrace, walker: Walker): Fmt {
        return buildDecodeTraceStepsFmt(trace, walker)
    }
}
