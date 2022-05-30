import { Walker } from '@scale-codec/core'
import { assert } from '@scale-codec/util'
import { Fmt, fmt, sub } from 'fmt-subs'
import { tryInspectValue, formatWalkerStep } from './util'

export class DecodeTrace {
  public parent: DecodeTrace | null = null

  /**
   * Location
   */
  public loc: string[]
  public input?: { offset: number }
  public result?: { offset: number; value: unknown }
  public error?: unknown
  public children: DecodeTrace[] = []

  public constructor(loc: string) {
    this.loc = [loc]
  }

  public findRoot(): DecodeTrace {
    return this.parent ? this.parent.findRoot() : this
  }

  public get isRoot(): boolean {
    return !this.parent
  }

  public setParent(trace: DecodeTrace): this {
    this.parent = trace
    return this
  }

  public refineLoc(loc: string): this {
    this.loc.push(loc)
    return this
  }

  public setInput(offset: number): this {
    this.input = { offset }
    return this
  }
}

export class DecodeTraceCollector {
  private current: DecodeTrace | null = null

  public decodeStart(loc: string, walker: Walker) {
    if (this.current && !this.current.input) {
      this.current.setInput(walker.idx).refineLoc(loc)
    } else {
      const newTrace = new DecodeTrace(loc).setInput(walker.idx)

      if (!this.current) {
        this.current = newTrace
      } else {
        const child = newTrace.setParent(this.current)
        this.current.children.push(child)
        this.current = child
      }
    }
  }

  /**
   * @returns the root decode trace if it was the root
   */
  public decodeSuccess(walker: Walker, decodedValue: unknown): null | DecodeTrace {
    assert(this.current, 'No current')
    this.current.result = { value: decodedValue, offset: walker.idx }

    if (!this.current.parent) {
      const trace = this.current
      this.current = null
      return trace
    } else {
      this.current = this.current.parent
      return null
    }
  }

  /**
   * @returns Returns root trace
   */
  public decodeError(err: unknown): DecodeTrace {
    assert(this.current, 'No current')
    this.current.error = err
    return this.current.findRoot()
  }

  public refineLoc(loc: string) {
    assert(this.current, 'No current')
    if (this.current.input) {
      const newTrace = new DecodeTrace(loc).setParent(this.current)
      this.current.children.push(newTrace)
      this.current = newTrace
    } else {
      this.current.refineLoc(loc)
    }
  }
}

interface BuildTraceCtx {
  walker: Walker
}

function tracePath(trace: DecodeTrace): string[] {
  const path: string[] = []

  for (let current: DecodeTrace | null = trace; current; current = current.parent) {
    for (let len = current.loc.length, i = len - 1; i >= 0; i--) {
      path.push(current.loc[i])
    }
  }

  path.reverse()

  return path
}

const INDENT = ' '.repeat(4)

function buildStepsRecursive(trace: DecodeTrace, ctx: BuildTraceCtx): Fmt {
  const errored = !!trace.error
  const resultVal = trace.result

  const path = tracePath(trace).join(' / ')
  const result = errored
    ? fmt`ERROR - ${sub(trace.error, '%s')}`
    : resultVal
    ? sub(tryInspectValue(resultVal.value), '%O')
    : '<not computed>'
  const walk = trace.input
    ? `<${formatWalkerStep({
        walker: ctx.walker,
        offsetStart: trace.input.offset,
        offsetEnd: trace.result?.offset,
      })}>`
    : '<no input>'

  let acc = Fmt.concat(
    fmt`${path}\n`,
    fmt`${INDENT}Walk: ${walk}\n`,
    fmt`${INDENT}Result: ${result}\n`,
    fmt`${INDENT}Child steps: ${trace.children.length}\n`,
  )

  if (trace.children.length) {
    acc = acc.concat(...trace.children.map((x) => buildStepsRecursive(x, ctx)))
  }

  return acc
}

/**
 * @remarks
 * This function shouldn't be in the `DecodeTrace` class itself due to provide a tree-shaking possibility. This is not
 * the main part of this class, but the side tool, used for pretty-print in the console.
 */
export function buildDecodeTraceStepsFmt(trace: DecodeTrace, walker: Walker): Fmt {
  return buildStepsRecursive(trace, { walker })
}
