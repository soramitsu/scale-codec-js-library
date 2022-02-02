import { Walker } from '@scale-codec/core'
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

function formatU8(u8: Uint8Array, start: number, end: number | undefined): string {
    return [...u8]
        .map((byte, i) => {
            const hex = byte.toString(16).padStart(2, '0')
            const prefix = i === start ? '(start) ' : i === end ? '(end) ' : ''
            return prefix + hex
        })
        .join(' ')
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
