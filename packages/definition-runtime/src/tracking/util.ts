import { Walker } from '@scale-codec/core'
import { toHex } from '@scale-codec/util'
import { TrackValueInspectable, TrackValueInspect } from './types'

export interface FormatWalkerStepParams {
    walker: Walker
    /**
     * The walker's offset at the start of the step
     */
    offsetStart: number
    /**
     * The walker's offset at the end of the step
     */
    offsetEnd?: number
}

const ELLIPSIS = '…'

function formatU8(u8: Uint8Array, start: number, end: number | undefined): string {
    const hex = toHex(u8.subarray(Math.min(start, end ?? Infinity), Math.max(start, end ?? Infinity)))
    return `${start > 0 ? ELLIPSIS : ''}${hex}${typeof end === 'number' && end < u8.length ? ELLIPSIS : ''}`
}

function formatWalkerOffset(start: number, end?: number): string {
    const offsetValue = typeof end === 'number' ? `${start}..${end}` : start

    let deltaSuffix = ''
    if (typeof end === 'number') {
        const delta = end - start
        deltaSuffix = ` (${delta >= 0 ? `+${delta}` : delta})`
    }

    return `offset: ${offsetValue}${deltaSuffix}`
}

export function formatWalkerStep(params: FormatWalkerStepParams): string {
    return `${formatWalkerOffset(params.offsetStart, params.offsetEnd)}; ${formatU8(
        params.walker.u8,
        params.offsetStart,
        params.offsetEnd,
    )}`
}

export function isTrackValueInspectable(value: unknown): value is TrackValueInspectable {
    return typeof value === 'object' && TrackValueInspect in (value as any)
}

export function tryInspectValue(value: any): any {
    if (isTrackValueInspectable(value)) {
        return value[TrackValueInspect]()
    }
    return value
}
