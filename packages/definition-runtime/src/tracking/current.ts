import { Decode, DecodeResult } from '@scale-codec/core'
import { CodecTracker } from './types'

let __currentTracker: null | CodecTracker = null

/**
 * **Caution**: uses global state
 */
export function getCurrentTracker(): null | CodecTracker {
    return __currentTracker
}

/**
 * **Caution**: uses global state
 */
export function setCurrentTracker(tracker: null | CodecTracker) {
    __currentTracker = tracker
}

/**
 * **Caution**: uses global state
 */
export function trackDecode<T>(loc: string, input: Uint8Array, decode: Decode<T>): DecodeResult<T> {
    return __currentTracker?.decode?.(loc, input, decode) ?? decode(input)
}

/**
 * **Caution**: uses global state
 */
export function trackRefineDecodeLoc<T>(loc: string, headlessDecode: () => DecodeResult<T>): DecodeResult<T> {
    return __currentTracker?.refineDecodeLoc?.(loc, headlessDecode) ?? headlessDecode()
}
